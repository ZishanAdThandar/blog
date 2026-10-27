---
title: "Node.js October 2026 Security Releases: Brotli RCE, DNS and TLS Bypasses"
layout: post
category: research
description: "Node.js ships critical fixes for Brotli decoder RCE, DNS NUL truncation, TLS hostname bypasses, HTTP agent reuse, and more across v22.x, v24.x, and v26.x."
date: 2026-10-27
tags: [nodejs, rce, cve, brotli, tls, dns, security, vulnerability]
last_modified_at: 2026-10-27
---

<div style="margin-bottom: 2rem;">
  <span style="background: var(--gradient); color: white; padding: 0.3rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600;">
    <i class="fab fa-node-js"></i> NODE.JS · SECURITY RELEASES
  </span>
</div>

## Node.js October 2026 Security Releases
### Critical Brotli RCE and multiple high-severity flaws patched

<div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid var(--primary); padding: 1.5rem; border-radius: 0 12px 12px 0; margin: 2rem 0 3rem 0;">
  <p style="font-size: 1.2rem; margin: 0;">
    Update now: Node.js <strong>v22.23.4</strong>, <strong>v24.22.1</strong>, and <strong>v26.12.1</strong> fix a Brotli decoder out-of-bounds write that can lead to <strong>remote code execution</strong>.
  </p>
</div>

<p style="color: var(--gray); margin-bottom: 3rem;">
  The Node.js project released security updates on October 21, 2026 addressing ten vulnerabilities across all currently supported release lines.
</p>

## Details

- **Highest severity:** CVE-2026-111497 - Brotli decoder out-of-bounds write leading to RCE (High). Affects v22.x, v24.x, v26.x.
- **High severity:** DNS NUL truncation (CVE-2026-105482), fullwidth digit IP TLS bypass (CVE-2026-105483), leading-zero/loose IP TLS bypass (CVE-2026-106069).
- **Updates required:** Update to Node.js 22.23.4, 24.22.1, or 26.12.1 depending on your release line.
- **Also fixed:** HTTP agent keep-alive response confusion, additional TLS validation issues, `crypto` snapshot entropy caching, ZipFile validation, and Permission Model bypasses.

## Affected Versions and Fixed Releases

| Release Line | Fixed Version | Status |
| --- | --- | --- |
| v26.x | **26.12.1** | Current/Active |
| v24.x | **24.22.1** | LTS |
| v22.x | **22.23.4** | LTS (Maintenance) |

All supported release lines received updates. EOL versions are affected and should be upgraded.

## Vulnerabilities Fixed

### High Severity

| CVE | Issue | Affected | Notes |
| --- | --- | --- | --- |
| **CVE-2026-111497** | Brotli decoder out-of-bounds write → RCE | v22.x, v24.x, v26.x | Malformed Brotli input to `node:zlib` can corrupt memory via an invalid block switch being treated as "need more input". Can lead to crash, memory disclosure, or RCE. |
| **CVE-2026-105482** | `dns.resolve*()`/`dns.reverse()` truncate hostnames containing NUL (`\0`) | v22.x, v24.x, v26.x | Incomplete fix for CVE-2026-48930. `dns.lookup()` was fixed before, but `dns.resolve*()` passes strings to c-ares as C strings and truncates at NUL. Allowlist validation can be bypassed. |
| **CVE-2026-105483** | TLS hostname verification bypass with fullwidth digit IPs (e.g. `１２７.0.0.1`) | v24.x, v26.x | `tls.checkServerIdentity()` doesn't recognize fullwidth digits as IP literals; normalizes/resolves differently and may match against DNS SANs/CN allowing certs not issued for that IP. Regression after CVE-2026-48618 fix. |
| **CVE-2026-106069** | TLS hostname bypass when host loosely resolves to different IP (leading zero octets) | v22.x, v24.x, v26.x | `0127.0.0.1` normalized per WHATWG URL rules as octal on some code paths while OS resolver treats as decimal on platforms like macOS, causing validation against wrong IP. | 

### Medium Severity

| CVE | Issue | Affected | Notes |
| --- | --- | --- | --- |
| **CVE-2026-105481** | HTTP Agent keep-alive accepts response written before request sent | v22.x, v24.x, v26.x | Incomplete fix for CVE-2026-48931. If unsolicited response arrives before guard runs (event loop busy), it can be parsed as response to next request on reused connection. |
| **CVE-2026-106072** | TLS validation accepts DNS SAN for non-canonical IPv4 spellings | v22.x, v24.x, v26.x | Hosts like `0177.0.0.1`, `0x7f.0.0.1`, `2130706433`, `127.1` not classified as IPs but normalized then matched against DNS SANs; cert with only `DNS:127.0.0.1` may be accepted. Requires CA-trusted cert and resolver accepting these forms (glibc). |
| **CVE-2026-106074** | `crypto.randomUUID()`/`randomUUIDv7()`/`randomInt()` entropy cache persisted in snapshots/SEAs | v22.x, v24.x, v26.x | If called during snapshot build (`--build-snapshot`) or in SEAs using snapshots, all processes from that snapshot repeat same values until cache refills (~127 UUIDs, ~1000 randomInt values). Collisions/predictability possible. |

### Low Severity

| CVE | Issue | Affected | Notes |
| --- | --- | --- | --- |
| **CVE-2026-106070** | `zlib.ZipFile` returns attacker-controlled prefix bytes after header validation failure | v26.x | On header mismatch, validation error caught but cached local header left without content offset; subsequent read can return bytes from start of file while CRC still passes. Can cause different extraction than other ZIP parsers. |
| **CVE-2026-106071** | Permission Model over-grant via wildcard radix lookup | v26.x | If wildcard grant (e.g. `--allow-fs-read=/etc/passwd.*`) is at root of permission tree and requested path shorter than prefix, lookup treats as match (e.g. allows reading `/etc/passwd`). Different from CVE-2026-58043. |
| **CVE-2026-106073** | Permission Model bypass via `fs.realpathSync()` | v22.x, v24.x, v26.x | Incomplete fix for CVE-2026-21715 (only covered `fs.realpathSync.native()`). `fs.realpathSync()` can be used to probe/resolve paths outside permitted dirs under `--permission`. |

## Impact & Recommendations

- **Prioritize patching** if you decompress untrusted Brotli data with `node:zlib`, or run internet-facing Node.js services (especially HTTP clients/servers doing TLS). The Brotli RCE is the most critical.
- **Update immediately** to the fixed versions for your release line. Check with `node -v`.
- **Audit code** for usage of `dns.resolve*()`, `dns.reverse()`, TLS connections with user-supplied hostnames/IPs, HTTP keep-alive connection reuse, snapshot/SEA builds using `crypto.randomUUID/randomInt`, `zlib.ZipFile`, and code running under the Permission Model.
- **For Brotli**: any code path that accepts compressed input from untrusted sources must be updated. Do not rely on application-layer checks alone.
- **For snapshots/SEAs**: rebuild snapshots/executables with patched Node.js and avoid relying on `crypto.randomUUID/randomInt` for uniqueness/predictability-sensitive values until rebuilt.
- **EOL notice**: If you're on an EOL Node.js version, upgrade to a supported release line.

## How to Update

```bash
# Check current version
node -v

# Using nvm
nvm install 22.23.4  # or 24.22.1, 26.12.1
nvm use 22.23.4

# Using node version managers or package managers
# See https://nodejs.org/en/download for official binaries
```

If you're using containers, update base images. For compiled native addons, rebuild after updating Node.js.

## References

- [Node.js Blog: Wednesday, October 21, 2026 Security Releases](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)
- [Node.js Security Policy](https://nodejs.org/en/security/)
- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)
- [Node.js Downloads](https://nodejs.org/en/download)
- [CVE-2026-111497](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-111497)
- [CVE-2026-105482](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-105482)
- [CVE-2026-105483](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-105483)
- [CVE-2026-106069](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-106069)
- [CVE-2026-105481](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-105481)
- [CVE-2026-106072](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-106072)
- [CVE-2026-106074](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-106074)
- [CVE-2026-106070](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-106070)
- [CVE-2026-106071](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-106071)
- [CVE-2026-106073](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-106073)
