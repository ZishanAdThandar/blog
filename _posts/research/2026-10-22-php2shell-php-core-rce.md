---
title: "PHP2Shell: How Two Bugs in PHP Core Became Pre-Auth RCE"
layout: post
category: research
description: "CVE-2026-109618 and CVE-2026-109619 turn interrupted PHP request cleanup into unauthenticated remote code execution. Here is how the PHP2Shell chain works, what is affected, how to detect it, and why patching is the only complete fix."
date: 2026-10-22
tags: [php, rce, cve, memory-corruption, exploitation, web-security, patch-management]
last_modified_at: 2026-10-23
---

<div style="margin-bottom: 2rem;">
  <span style="background: var(--gradient); color: white; padding: 0.3rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600;">
    <i class="fas fa-bolt"></i> PHP · MEMORY CORRUPTION · CVE-2026-109618 / CVE-2026-109619
  </span>
</div>

## PHP2Shell
### When PHP runs out of memory at exactly the wrong moment

<div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid var(--primary); padding: 1.5rem; border-radius: 0 12px 12px 0; margin: 2rem 0 3rem 0;">
  <p style="font-size: 1.2rem; margin: 0;">
    The exploit runs before your framework, your authentication middleware, or your application code.<br>
    If the request reaches <strong>PHP itself</strong>, the application never gets a chance to say no.
  </p>
</div>

<p style="color: var(--gray); margin-bottom: 3rem;">
  Two CVEs, one exploit chain, and a patch window measured in hours. This is the PHP2Shell incident.
</p>

## Contents

- [TL;DR](#tldr)
- [What happened](#what-happened)
- [Affected and fixed versions](#affected-and-fixed-versions)
- [The root cause: interrupted state treated as valid](#the-root-cause-interrupted-state-treated-as-valid)
- [CVE-2026-109618: interrupted initialization after OOM](#cve-2026-109618-interrupted-initialization-after-oom)
- [CVE-2026-109619: stale state across requests](#cve-2026-109619-stale-state-across-requests)
- [How the PHP2Shell exploit works](#how-the-php2shell-exploit-works)
- [Why authentication and WAFs are not enough](#why-authentication-and-wafs-are-not-enough)
- [Exploitation in the wild](#exploitation-in-the-wild)
- [How to detect exploitation](#how-to-detect-exploitation)
- [Patch and mitigation guidance](#patch-and-mitigation-guidance)
- [Incident response checklist](#incident-response-checklist)
- [The bigger lesson: AI lowers the exploit barrier](#the-bigger-lesson-ai-lowers-the-exploit-barrier)
- [References](#references)

## TL;DR

- **CVE-2026-109618** and **CVE-2026-109619** are critical memory-safety flaws in PHP core. Both are rated **CVSS v4.0 9.2**.
- They allow unauthenticated remote code execution on default PHP deployments, independent of the application running on top. WordPress, Drupal and Joomla were demonstrated as targets, but a "Hello World" PHP script is equally in scope.
- Every PHP release since at least **5.4** is affected by one or both flaws. Official fixes exist for **PHP 8.2.35, 8.3.36, 8.4.27 and 8.5.12**.
- The exploit chain is called **PHP2Shell**. It combines memory corruption with a process-memory disclosure technique that leaks addresses through the `PHPSESSID` cookie.
- Exploitation attempts were observed **before public disclosure**, as early as 17 October 2026.
- Configuration changes reduce exposure but do not fix the bug. **Patching and restarting every worker is the only complete remediation.**

## What happened

PHP gave advance notice on 20 October of an out-of-band security release scheduled for **21 October 2026 at 14:00 UTC**, then shipped on that schedule as details of the flaws began to leak.

The vulnerabilities were found by Wiz Research using frontier AI models, and reported to the PHP security team on 24 August 2026. Wiz demonstrated unauthenticated RCE against current WordPress, Drupal and Joomla container images. PHP acknowledged the report on 21 September and built a coordinated fix.

| Date (2026) | Event |
| --- | --- |
| 19 August | Wiz discovers the first PHP vulnerability during an AI-assisted source audit |
| 20–21 August | Unauthenticated RCE confirmed on Drupal and WordPress |
| 24 August | Wiz reports the vulnerabilities to the PHP security team |
| 21 September | PHP acknowledges the reports and starts the coordinated fix |
| 17 October | AWS reports PHP2Shell exploitation attempts in MadPot telemetry, four days before disclosure |
| 20 October | PHP gives advance notice of a critical release |
| 21 October, 14:00 UTC | PHP ships 8.2.35, 8.3.36, 8.4.27 and 8.5.12; public disclosure follows |

Wiz named the combined exploit script **PHP2Shell**: a PHP worker that can be turned into a shell.

The flaws had existed in PHP for more than a decade. What changed was not the presence of the bug, but the practicality of exploiting it. Memory corruption across request boundaries normally requires deep knowledge of PHP's allocator, request lifecycle and target-specific memory layout. AI-assisted research made that work tractable, and made adapting the exploit to different applications and PHP builds much faster.

## Affected and fixed versions

Any PHP runtime that serves HTTP requests is in scope:

- Apache with `mod_php`
- PHP-FPM
- `php-cgi`
- FrankenPHP
- LiteSpeed
- Containers and appliances that bundle their own PHP interpreter

| PHP branch | Affected releases | First fixed release |
| --- | --- | --- |
| 8.2 | Before 8.2.35 | **8.2.35** |
| 8.3 | Before 8.3.36 | **8.3.36** |
| 8.4 | Before 8.4.27 | **8.4.27** |
| 8.5 | Before 8.5.12 | **8.5.12** |

PHP 8.1 and older are outside upstream support. The PHP security team published minimal source backports for **7.4**, **8.0** and **8.1**, and some distributions or LTS vendors provide their own backports. PHP 8.2 reaches end of life on 31 December 2026.

The inventory problem is bigger than `php -v`:

- The CLI binary and the FPM/Apache module can be different versions.
- Containers may bundle a PHP runtime that is unrelated to the host package.
- Control panels, appliances and CI runners often ship their own PHP.
- A vendor may backport the fix without changing the upstream version number.

Check the runtime that actually serves requests, not just the one in your shell.

## The root cause: interrupted state treated as valid

Both CVEs follow the same pattern:

1. A fatal error interrupts PHP partway through an operation.
2. PHP cleans up or reuses internal state that was never fully initialized, or that points to memory which has already been freed.
3. The stale state is treated as valid.

This is not an application bug. It is a lifecycle bug in the engine. That is why authentication, input filtering and application-level authorization cannot stop it: the vulnerable code runs during request parsing or request shutdown, before the script gets control.

The patch changes how memory exhaustion interrupts execution. A soft limit defers the error until PHP reaches a safe point, allowing an in-progress operation to finish initializing. A hard limit terminates the worker immediately with `_exit(137)` instead of running normal cleanup over invalid state. The patch also resets request-owned global state before it can be reused.

## CVE-2026-109618: interrupted initialization after OOM

PHP converts a form submission into the `$_POST` array. Internally, the array is a hash table, and each entry is a bucket.

In the vulnerable path, the hash table increments its entry counters **before** it allocates a copy of the key:

```c
idx = ht->nNumUsed++;
ht->nNumOfElements++;
p = ht->arData + idx;
p->key = key = zend_string_init(str, len, GC_FLAGS(ht) & IS_ARRAY_PERSISTENT);
```

If the key allocation exceeds `memory_limit`, PHP raises a fatal error and abandons the insertion. The counters already include the new bucket, but the bucket's key and value were never initialized.

PHP still destroys the request. When it walks the array during cleanup, it treats every counted bucket as a live PHP value. The uninitialized bucket contains leftover heap bytes, and an attacker who can control those bytes can shape what the cleanup code does next.

The public analysis shows the full chain:

1. Send a request that causes the key allocation to fail at the right moment.
2. Groom the heap so the unfinished bucket contains attacker-controlled data.
3. Shape that data to look like a PHP array with a destructor callback.
4. Point the callback at `system()` and the element at a command string.
5. Let request shutdown call the callback.

The result is command execution with the web worker's privileges, typically `www-data`. The exploit can return **HTTP 200**, complete in a few seconds, and leave the worker running. A successful attack does not have to produce a crash or an obvious error page.

Datadog's reproduction used:

- PHP 8.5.11 on Debian 12 (ARM64)
- Apache prefork with `mod_php`
- `memory_limit=16M`
- `post_max_size=64M`
- automatic POST parsing

The request body shape was roughly:

```text
=[binary value]&a=1&<very long field name>[x]=1
```

The empty-name field prepares reusable memory. `a=1` causes hash table allocation. The oversized field name triggers the interrupted insertion. The full payload is more complex than this sketch; the important defensive signal is the shape, not a copyable exploit.

The hash-table insertion path is one instance of the broader flaw. The advisory describes the class, and the patch fixes the error handling around it. Researchers expect variants to surface.

## CVE-2026-109619: stale state across requests

PHP workers handle many requests over their lifetime. Some worker-wide fields point to memory owned by a single request. If PHP frees that memory without clearing the field, a later request can follow a dangling pointer.

Public analyses describe several exploitable instances grouped under this CVE:

- **Fatal-error backtrace use-after-free (PHP 8.5):** PHP retains the backtrace of the most recent fatal error in a worker global. A fatal out-of-memory error can destroy the request heap without clearing it. If the next request emits a diagnostic early enough, PHP reads the stale backtrace before reinitializing it. PHP confirmed command execution on `mod_php`.
- **Upload-progress unserializer use-after-free:** Session upload-progress handling can initialize session state before normal module initialization. A fatal allocation failure can leave the unserializer's global state published. A later request on the same worker can consume attacker-reclaimed memory as live bookkeeping. PHP confirmed command execution on both `mod_php` and PHP-FPM.
- **OPcache type confusion:** OPcache persists compiled structures in shared memory and uses per-worker pointer maps. An allocation failure between advancing a process-local frontier and publishing the shared frontier can leave partially persisted objects referring to slots the shared state still considers free. A later worker can reuse the slot for a different object, creating a cross-worker type confusion. Wiz used this to build an unauthenticated RCE chain against WordPress.

The upload-progress case is especially important because session upload progress is enabled by default and runs even if the application never calls `session_start()`. An application cannot opt out by simply not using sessions.

CVE-2026-109619 requires the attacker's requests to reach the same worker. A larger worker pool lowers the success rate of each attempt, but it does not remove the flaw.

## How the PHP2Shell exploit works

The public write-ups describe a chain with four practical stages.

### 1. Leak memory through the session cookie

CVE-2026-109618 includes an application-agnostic memory disclosure. PHP parses RFC1867 multipart requests during request startup, before normal module initialization completes. Session upload-progress handling can publish a session ID in `PS(id)`. If an out-of-memory error aborts the request before cleanup, `PS(id)` can be left pointing at freed memory.

A later multipart request can reach the upload-progress cleanup path before session initialization resets the pointer. PHP trusts the stale pointer and length as a live string and URL-encodes the reclaimed heap contents into a **`PHPSESSID` response cookie**.

The leaked region can contain pointers, passwords, tokens, API keys and certificates from other requests handled by the same worker. For exploitation, the important part is that it removes address uncertainty.

### 2. Defeat ASLR

The cleanup-to-code-execution primitive needs valid addresses for the fake data structures and for the function it calls, such as `system()`. ASLR randomizes those addresses. A leak of live worker memory gives the attacker addresses that are valid in the same process, making the exploit reliable instead of a crash-prone guess.

### 3. Corrupt the worker and execute a command

The attacker sends a crafted request that triggers the interrupted insertion, with heap grooming so the uninitialized bucket contains the fake structures. During shutdown, PHP destroys `$_POST`, follows the fake array, and calls the chosen callback with the chosen argument.

### 4. Repeat until the target falls

Wiz demonstrated the combined script against the latest WordPress, Drupal and Joomla container images at the time of testing. Datadog's reproduction executed a command in about **3.10 seconds**, returned HTTP 200, and kept the Apache worker alive. The process tree showed a shell child under the web worker.

The attack is not a CMS exploit. The CMSs were chosen as representative targets. The vulnerable code is in the PHP engine, so any PHP application on an affected build is exposed.

## Why authentication and WAFs are not enough

- **Authentication:** the vulnerable path runs before application code. A login page, API gateway or framework middleware is irrelevant if the request is processed by PHP's request parser first.
- **Input filtering:** the malicious data is in the form-field structure and heap layout, not in a parameter your application validates.
- **WAF signatures:** a WAF can block known payload shapes and oversized form fields, and that is useful as a stopgap. It is not a fix. The exploit can be adapted, and a WAF that truncates or skips large bodies may never inspect the relevant bytes.
- **Reverse proxy limits:** limiting decoded body size, field count, header count and nesting depth at the edge is one of the strongest interim controls. It still does not repair the engine.

The PHP advisory is explicit: the listed configuration changes reduce exposure to specific attack paths, but **only an update is a complete solution**.

## Exploitation in the wild

The patch window was effectively zero:

- AWS Threat Intelligence identified PHP2Shell exploitation attempts in MadPot telemetry on **17 October 2026**, four days before public disclosure.
- Cloudflare reported signs of early exploitation and deployed temporary WAF rules before the patch was public.
- watchTowr reported exploitation through its honeypot network on 21 October.
- Datadog reported multiple public reports of active exploitation and broad untargeted scanning by 21 October.

This is consistent with attackers monitoring vendor repositories and pre-announcement traffic. Once a patch exists, diffing it is enough to locate the vulnerable path; a working exploit can follow quickly.

## How to detect exploitation

No single signal is conclusive. Correlate the request, the PHP error log and the process tree.

### Suspicious form submissions

Look for:

- Form field names that are unusually long (the public reproduction used roughly **3.5 MB**).
- Raw null bytes or unexpected control characters in form values.
- Very large `application/x-www-form-urlencoded` or multipart bodies.
- A field with an empty name followed by a very large nested field name.

A WAF or reverse proxy should be configured to flag these shapes, but verify that it actually inspects the full body. A rule cannot inspect bytes the engine truncates.

### Memory exhaustion during request initialization

The characteristic error looks like this:

```text
PHP Fatal error: Allowed memory size of 16777216 bytes exhausted
(tried to allocate 3500032 bytes) in Unknown on line 0
```

`Unknown on line 0` means the failure happened during request initialization, before any script line executed. That is a strong signal when it correlates with oversized POST requests.

Search for it:

```bash
grep -R "Unknown on line 0" /var/log/php* /var/log/apache2 /var/log/nginx 2>/dev/null
grep -R "Allowed memory size" /var/log/php* /var/log/apache2 /var/log/nginx 2>/dev/null
```

Also look for worker crashes:

```text
AH00052: child pid ... exit signal Segmentation fault (11)
```

Memory exhaustion alone is not proof of an attack; legitimate workloads can hit the limit. The combination of an oversized form, an initialization-time OOM and a worker crash is much stronger.

### Unexpected child processes

A web worker spawning a shell is the most direct evidence of successful exploitation:

```text
apache2 (www-data)
└── sh -c <reverse-shell command>
    └── bash [outbound connection to c2.example:443]
```

On a host with `auditd`:

```bash
ausearch -m execve -ts recent 2>/dev/null | \
  grep -E 'sh|bash|dash|curl|wget|nc|ncat|socat|mkfifo|/dev/tcp'
```

Without `auditd`, baseline the process tree and look for anomalies:

```bash
ps -eo user,ppid,pid,etime,cmd --sort=ppid | \
  grep -E 'www-data|apache|php-fpm|nginx'
```

Investigate any shell, downloader or network utility launched by a web worker. If the application legitimately runs external commands, build a baseline of expected activity first.

### `PHPSESSID` anomalies

Unexpectedly large or malformed `PHPSESSID` response cookies are a signal of the memory-disclosure path. This is easy to miss because the application may never use sessions.

### For CVE-2026-109619

Review early configuration warnings, shutdown diagnostics, fatal errors and execution timeouts on attacker-reachable routes. The stale-state paths often begin with a fatal error in one request and a diagnostic in the next.

## Patch and mitigation guidance

### 1. Patch first

Update to PHP **8.2.35**, **8.3.36**, **8.4.27** or **8.5.12**, or to your vendor's patched package.

```bash
php -v
php-fpm -v
```

Then restart the runtime that serves requests:

```bash
# Debian/Ubuntu example
systemctl restart php8.5-fpm
systemctl restart apache2

# Verify the module version used by Apache
apache2ctl -M | grep php
```

If you use containers, rebuild the image from an updated base and redeploy. Pulling a new `php` CLI image does not update a running FPM container, and rebuilding an application image does not update a base image that was cached.

### 2. If you cannot patch immediately

The PHP advisory lists these interim controls. They reduce exposure but do not make an installation safe.

**For CVE-2026-109618:**

- Set `memory_limit=-1` at the administrator level, preferably with `php_admin_value` in the FPM pool or Apache configuration. Check that no pool, directory or application setting puts a finite limit back.
- Set a low `post_max_size` (`8M` if uploads are not required, `32M` if they are) and keep `upload_max_filesize` below it.
- Enforce limits at the web server or proxy for decoded request size, input field count, multipart part count, header count and nesting depth. Cover requests without a usable `Content-Length`.
- Use a container or cgroup memory limit as an availability boundary. Do **not** substitute `RLIMIT_AS` or `RLIMIT_DATA`; those can trigger the vulnerable allocation failure.

**For CVE-2026-109619:**

- Set `session.upload_progress.enabled=0`, then restart every worker. Apply it in `php.ini`, an FPM pool or server configuration that loads before request parsing. Do not rely on `ini_set()` or `.user.ini`.
- On PHP 8.5, set `fatal_error_backtraces=0` and restart every worker.
- Remove per-request invalid or deprecated settings that emit diagnostics before initialization. Hiding diagnostics with `error_reporting`, `display_errors` or `@` does not help.
- Fix attacker-reachable fatal errors and execution timeouts.

### 3. Treat WAF rules as a bridge, not a destination

Vendor WAF rules and reverse-proxy limits can block known shapes and buy time. They do not remove the vulnerable code path. If you rely on them, verify that they inspect decoded bodies and do not silently skip oversized fields.

## Incident response checklist

If PHP2Shell may have been exploited in your environment:

1. **Patch and restart every worker.** A patched binary that is not loaded is not a fix.
2. **Check the runtime actually in use.** Include FPM pools, Apache modules, containers, CI runners, control panels and appliances.
3. **Search logs from 17 October onward.** Look for initialization-time OOMs, oversized form fields, large `PHPSESSID` response cookies, worker segfaults and unexplained 500s.
4. **Inspect process execution.** Look for shells, downloaders and outbound connections spawned by web workers.
5. **Hunt for persistence.** Web shells, modified application files, new cron jobs, new systemd units and unexpected outbound C2 traffic.
6. **Rotate secrets if compromise is plausible.** The memory-disclosure primitive can expose credentials, tokens and keys from other requests. Rotate application secrets, database credentials, API keys and session signing keys.
7. **Isolate exposed applications** while the scope is unknown, and preserve logs and process evidence.

## The bigger lesson: AI lowers the exploit barrier

PHP2Shell is being compared to Heartbleed and Log4Shell, and the comparison is reasonable. PHP underpins a huge portion of the web, the vulnerable code is in the engine rather than one application, and the exploit works without authentication.

The more important change is economic. Wiz says the flaws were hidden for over a decade because exploitation required a chain of memory-corruption steps that was at the edge of practical human research. Frontier models helped find the bugs, adapt the exploit to different memory layouts, and verify the patch. A single researcher completed work that previously would have taken a world-class team months.

That cuts both ways:

- Vulnerabilities that were "too complex to exploit" may no longer be.
- Defenders can use the same techniques to audit code, generate detections and validate patches.
- Patch velocity and asset inventory matter more than ever, because the gap between disclosure and exploitation is now measured in hours.

For PHP specifically, the long-term lesson is the same one memory-safety bugs have taught for decades: state that is interrupted halfway through initialization must never be treated as valid. The patch fixes the known paths, but the underlying pattern is likely to produce variants. Assume more CVEs in this class.

## References

- PHP, [Security advisory: Critical remote code execution vulnerabilities, update now](https://www.php.net/archive/2026.php#2026-10-21-5)
- PHP, [GHSA-w8hw-w9fx-j79w — CVE-2026-109618](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)
- PHP, [GHSA-6wmf-4rv5-p3rp — CVE-2026-109619](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)
- Wiz Research, [PHP2Shell: AI uncovers critical RCE vulnerabilities affecting 70% of the Internet](https://www.wiz.io/blog/php2shell-php-rce)
- Datadog Security Labs, [PHP2Shell — Critical vulnerabilities in PHP: detection, analysis, and remediation](https://securitylabs.datadoghq.com/articles/php2shell-critical-vulnerabilities-in-php/)
- AWS Security Blog, [Amazon Threat Intelligence identifies PHP2Shell exploitation prior to public disclosure in MadPot](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/)
- Cloudflare, [Cloudflare deploys protections against PHP vulnerabilities](https://blog.cloudflare.com/php-vulnerabilities-waf-protection)
- Huntress, [Rapid Response: php2shell, leaked critical PHP vulnerabilities](https://www.huntress.com/blog/php2shell-leaked-critical-php-vulnerabilities)
- Calif, [PHP2Shell research](https://calif.io/php2shell/)
- The PHP Foundation, [Today's PHP security release and how we're strengthening PHP security](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/)
- Patchstack, [PHP major vulnerability alert — October 2026](https://patchstack.com/articles/php-major-vulnerability-alert-10-2026/)
- CERT-EU, [Security advisory 2026-018](https://cert.europa.eu/publications/security-advisories/2026-018)
- php2shell.com, [PHP2Shell: what you need to know](https://www.php2shell.com/)
