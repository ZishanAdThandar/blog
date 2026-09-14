---
layout: post
title: "Log Hunter - Web Log Forensics to Recover Stolen Backup"
description: "CTF writeup analyzing Apache access logs to identify a successful scanner probe that exfiltrated a backup.txt containing the flag, then accessing the recovered file."
category: hackerdna
tags: [web, ctf, hackerdna, log-analysis, forensics, apache, incident-response, sqli]
---

## Log Hunter - CTF Writeup

**Category:** FORENSICS | **Flags:** 1

Challenge: [https://hackerdna.com/labs/log-hunter](https://hackerdna.com/labs/log-hunter)

## Contents

- [Download & Format](#download--format)
- [Log Analysis](#log-analysis)
- [Recovery & Flag](#recovery--flag)

## Download & Format

The lab provides a downloadable `access.log` from a vulnerable web server and asks:
find a file that attackers successfully accessed during their probe, and recover the
flag hidden inside it.

```bash
curl -sL 'https://lab.hdna.me/81-log-hunter/access.log' -o access.log
wc -l access.log  # 177 lines
```

## Log Analysis

The log uses the Apache Combined format. A quick pass filtering for HTTP 200 responses
to non-static assets highlights a suspicious hit:

```bash
grep ' 200 ' access.log | grep -vE '\.(png|jpg|gif|css|js|html|xml|txt|ico)' \
  | grep -E '(admin|login|php|upload|env|git|config|backup|shell|cgi|test|api)'
```

Key finding:

```
172.16.0.88 - - [22/Jul/2025:08:32:44 +0000] "GET /backup.txt HTTP/1.1" 200 42
  "https://attacker.com/tools" "SecScanner/1.0"
```

| Field         | Value                                                                 |
|---------------|-----------------------------------------------------------------------|
| IP            | `172.16.0.88` (internal attacker IP)                                  |
| Status        | `200` (successful access)                                             |
| Size          | `42` bytes (matches UUID + newline)                                   |
| Referer       | `https://attacker.com/tools`                                          |
| User-Agent    | `SecScanner/1.0`                                                      |

All other requests from this IP (`/admin/`, `/.env`, `/.git/`, `/config.php`, `/phpmyadmin/`)
returned **404**, confirming that `backup.txt` was the only successfully accessed sensitive
file. The log clearly shows an automated scanner crawling common paths and stumbling onto
a real file.

## Recovery & Flag

Downloading the file from the same server reveals the flag immediately:

```bash
curl -s 'https://lab.hdna.me/81-log-hunter/backup.txt'
```

```
FLAG: 1e3e1e7c-6b64-4727-b4bb-6e9945edd9b7
```

**Flag:** `1e3e1e7c-6b64-4727-b4bb-6e9945edd9b7`

## How the Attack Works

The attacker ran an automated scanner (`SecScanner/1.0`) that brute-forced common
admin and sensitive paths against the web server. Most probes failed (404), but the
scanner found `/backup.txt` - a plain-text file left in the web root containing
sensitive information. In a real incident this pattern (scanner + `attacker.com` referrer
+ unusual path + 200 response) is the primary indicator of compromise to triage first.

## Key Takeaways

- **Never leave sensitive files in the web root.** Backup files, database dumps,
  config files and `.env` should live outside the web-accessible directory.
- **Log analysis starts with anomalies.** A 200 to an unusual path from a non-standard
  User-Agent is the first thing an incident responder should flag.
- **Automated scanners leave obvious signatures** - consistent timing, list-like path
  progression, and a referer pointing back to the attacker infrastructure.
- **HTTP status codes tell the story.** Filter for 200s to non-public paths first -
  those are your real findings.