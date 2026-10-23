---
title: "eMudhra's Weak CA Keys: How Eight Bits Broke WebPKI Trust"
layout: post
category: research
description: "Eight eMudhra intermediate CA keys were generated with one-byte private scalars. This is how the compromise happened, why browsers blocked the certificates within hours, and why the rest of your trust stores are still the problem."
date: 2026-10-21
tags: [pki, tls, emudhra, certificate-authority, webpki, incident-response, cryptography]
last_modified_at: 2026-10-23
---

<div style="margin-bottom: 2rem;">
  <span style="background: var(--gradient); color: white; padding: 0.3rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600;">
    <i class="fas fa-certificate"></i> WEBPKI · INCIDENT ANALYSIS
  </span>
</div>

## eMudhra's Weak CA Keys
### Eight intermediates, eight bits of entropy, and a very long tail of clients

<div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid var(--primary); padding: 1.5rem; border-radius: 0 12px 12px 0; margin: 2rem 0 3rem 0;">
  <p style="font-size: 1.2rem; margin: 0;">
    Nobody stole these keys.<br>
    They were generated with so little randomness that <strong>anyone could recover them from the public certificates</strong> in milliseconds.
  </p>
</div>

<p style="color: var(--gray); margin-bottom: 3rem;">
  Browsers fixed this in hours. The harder question is everything else that trusts a certificate bundle on disk.
</p>

## What happened

On the evening of **17 October 2026**, an independent researcher reported to Apple, Google, Microsoft, Mozilla and eMudhra that the private keys for eight eMudhra intermediate CA certificates were compromised. The report was signed with each of the eight keys, which made the claim difficult to dismiss.

The response was unusually fast for the WebPKI:

| Date (2026) | Event |
| --- | --- |
| 30 April 2025 | Eight intermediate CAs created during an eMudhra key generation ceremony |
| May 2025 | The same keys were also cross-signed by Sectigo's `AAA Certificate Services` root |
| Mid-2025 | The hierarchy entered browser trust stores |
| 17 October, 18:05 UTC | Chrome Root Program receives the report |
| 17 October, 19:45 UTC | Chrome blocks the six TLS intermediates via a CRLSet update |
| 17 October, 20:06 UTC | Mozilla receives the report |
| 17 October, 22:59 UTC | Firefox OneCRL block reaches users with standard settings |
| 18 October | eMudhra revokes all eight intermediates |
| 19 October | Apple blocks the certificates; Android receives an equivalent block through Google Play Services |
| 20 October | Microsoft blocks the certificates; Mozilla and Chrome publish details; Go ships emergency releases |
| 21 October | eMudhra publishes its account; Node.js, Red Hat and CERT-In respond; India's MeitY opens an investigation |
| 22 October | eMudhra offers Sectigo-issued certificates as an alternative |
| 27 October | Chrome Root Store v43 is expected to remove the `emSign ECC Root CA - G3` root |

The eight certificates were:

- **TLS, domain validated:** `EM DV TLS CA - G3B` and `EM DV TLS CA - G3C`
- **TLS, organization validated:** `EM OV TLS CA - G3B` and `EM OV TLS CA - G3C`
- **TLS, extended validation:** `EM EV TLS CA - G3B` and `EM EV TLS CA - G3C`
- **Code signing:** `EM OV CS CA - G3B` and `EM OV CS CA - G3C`

The six TLS intermediates chained to `emSign ECC Root CA - G3`, which was in the Chrome, Apple and (until 20 October) Mozilla root stores. Each of the eight also existed as a second certificate with the same public key, cross-signed by Sectigo.

## The keys were not stolen, they were guessable

The affected keys are elliptic-curve keys on the **P-384** curve. A private key is a scalar `d`; the public key is `d × G`, where `G` is the curve's fixed base point.

For a correctly generated P-384 key, `d` is a 384-bit random number. Recovering it from the public key is the elliptic-curve discrete logarithm problem, which is not practical. eMudhra's keys did not have that property.

Scott Helme recovered every key from the public certificates on a laptop in under a second. His table is the clearest illustration of the failure:

| Intermediate | Type | Private scalar `d` |
| --- | --- | --- |
| `EM DV TLS CA - G3B` | TLS | 156 |
| `EM DV TLS CA - G3C` | TLS | 230 |
| `EM EV TLS CA - G3B` | TLS | 115 |
| `EM EV TLS CA - G3C` | TLS | 56 |
| `EM OV TLS CA - G3B` | TLS | 155 |
| `EM OV TLS CA - G3C` | TLS | 4 |
| `EM OV CS CA - G3B` | Code signing | 66 |
| `EM OV CS CA - G3C` | Code signing | 237 |

A P-384 private key should look like this:

```text
d = 0x48ac06790886c80c48d31691fd4c0fe9ce3207f9807f2fe571d6e4ec426d78644298fc53df2b92566970e757ac998c34
```

eMudhra's keys looked like this:

```text
d = 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004
```

That is 47 bytes of zeros followed by one byte. A single byte has 256 possible values. The "attack" is to compute `1 × G`, `2 × G`, `3 × G` and stop when the result matches the public key. At most 255 point additions.

Nothing about the certificates looked structurally wrong. A public key derived from `d = 4` is a valid point on the curve. The encoding was valid, the curve was valid, and every format check passed. The weakness was in the value, not the structure.

## The key ceremony failure

eMudhra's account is that the eight intermediates were created on **30 April 2025** during a key generation ceremony on FIPS 140-2 Level 3 certified hardware security modules.

A flaw in one step of the ceremony produced a second, weak set of keys alongside the original strong keys. The weak keys were the ones published to the browser root stores. eMudhra says its infrastructure was not compromised, no root keys were exposed, and no end-entity certificates were issued from the affected intermediates.

That distinction matters, but it does not remove the risk:

- A CA private key does not need to have issued a certificate to be dangerous. Anyone holding it can issue one at any time while clients still trust the chain.
- Seven of the eight intermediates were never used in production. One was deployed, but eMudhra says it issued no certificates. Certificate Transparency records are consistent with that.
- The issue went undetected for roughly **18 months**, across two independent audit cycles.

The root cause is still under investigation. What is already clear is that the ceremony's validation did not check whether the generated private key had meaningful entropy. The HSM was present and certified; the process around it was not sufficient.

## Why browsers moved fast and everything else did not

Browsers have a privileged position in the PKI ecosystem:

- Chrome can push a **CRLSet** update that rejects a specific public key, including cross-signed copies.
- Firefox can push **OneCRL** without requiring a browser update or restart.
- Both require Certificate Transparency for publicly trusted TLS certificates. Chrome found no certificate chaining to the six TLS intermediates in CT logs, which is reassuring for browser users.

Most other TLS clients work differently. They read a CA bundle from disk, do not check revocation by default, and do not enforce CT. Revoking a certificate at the CA does not help a client that never asks whether it was revoked.

That leaves a long tail:

- **Install scripts and self-updaters** that download code over HTTPS without a signature check.
- **CI/CD runners** that fetch dependencies and push artifacts while holding cloud keys, registry tokens and signing keys.
- **Server-to-server API calls** carrying OAuth tokens, webhook payloads and customer data.
- **Containers and base images** with a frozen copy of `ca-certificates`.
- **IoT, embedded and OT devices** whose trust stores may not be updated before the certificates expire in 2039.
- **Windows code signing**, where a forged signature can look like legitimate signed software to anything that does not check revocation.

The practical consequence: for 17 months, a forged certificate for any hostname could have been accepted by a large amount of software that was not a browser. Whether anyone did that is unknown. CT logs can show logged certificates, but they cannot prove a negative, and many non-browser clients never log anything.

## What was actually at risk

The impact is best understood as **machine-in-the-middle**, not a data breach at eMudhra:

- An attacker with one of the keys and a position on the network path could impersonate any domain to a client that still trusted the chain.
- That could expose credentials, session tokens, API keys, and the contents of TLS connections.
- The code-signing intermediates could be used to sign malware that appears publisher-signed to clients that do not check revocation.

eMudhra says it has no evidence that the keys were recovered or exploited before disclosure. That is the correct statement, but it is not proof that nobody did. The keys were derivable from public data for 17 months.

## What to update

The list of fixes is long and still growing. The important part is to update the **trust store actually used by each workload**, not just the operating system's browser.

| Software | Fixed version | What it does |
| --- | --- | --- |
| Go | 1.27.3, 1.26.10 | Rejects any chain containing one of the eight keys (`CVE-2026-111943`); rebuild required |
| Firefox | 158.0.1, ESR 115.43.1, ESR 153.5.1 | Ships the OneCRL block for clients that cannot receive Remote Settings (`CVE-2026-113470`) |
| NSS | 3.131.1 | Removes `emSign ECC Root CA - G3` from the trust list |
| Node.js | 26.12.1, 24.22.1, 22.23.4 | Rejects the eight keys and updates the bundled root list |
| Python `certifi` | 2026.10.19 | Drops `emSign ECC Root CA - G3` |
| Rust `webpki-roots` | 1.0.10 | Drops `emSign ECC Root CA - G3` |
| Ubuntu `ca-certificates` | USN-8944-1 / USN-8944-2 | Removes the root from the system bundle |
| Debian `ca-certificates` | DSA-6572-1 | Removes the root and, on older releases, Sectigo `AAA Certificate Services` |
| Homebrew `ca-certificates` | 2026-09-25_1 | Excludes the affected roots/keys |
| Composer `ca-bundle` | 1.6.0 / 1.4.16 | Distrusts the eight intermediates and refreshes the root list |
| Cloudflare clients | WARP/1.1.1.1 2026.8.2115.0, `cloudflared` 2026.10.2 | Updated trust stores and chain rejection |
| Chrome Root Store | v43 (expected 27 October) | Removes `emSign ECC Root CA - G3` |
| RHEL | Bulletin RHSB-2026-012 | Workaround available; updated packages were pending at the time of writing |

Two caveats:

1. **Rebuilding is part of the update.** A new Go toolchain does not change an already-compiled binary. A new base image does not change a running container. A new Python package does not change a virtual environment that pins an old `certifi`.
2. **Do not disable verification.** Certificate errors after the update are expected for chains that depended on the distrusted root. The fix is to replace the certificate with one from another hierarchy, not to turn off TLS verification.

## How to check your own stack

Start by finding every trust store you actually depend on:

```bash
# OS trust store
openssl version -d
dpkg -l ca-certificates 2>/dev/null || rpm -q ca-certificates

# Python
python3 -c "import certifi; print(certifi.where())"
python3 -m pip config list

# Node.js
node -p "process.versions.openssl"
npm config get cafile

# Go
go version

# curl and git
curl -V
git config --get http.sslCAInfo

# Containers
{% raw %}docker images --format '{{.Repository}}:{{.Tag}}'{% endraw %}
```

Then:

- Rebuild every container image from an updated base image and redeploy it.
- Restart or replace workers that loaded the old trust store at start-up.
- Rebuild Go binaries with the patched toolchain. Check for statically linked tools you did not build yourself.
- Check appliances, agents and CI runners that are not managed through the normal OS update path.
- Use the public test page at [emudhra.we-have-a-problem.com](https://emudhra.we-have-a-problem.com/) to check a specific client path, but remember that a browser test does not prove a background service is protected.

For mutual TLS, uploaded client CA bundles and custom origin verification, review the application configuration directly. An SDK update does not necessarily update the HTTP library, runtime or custom verifier underneath it.

## Lessons for defenders

**1. A valid key is not a strong key.** The certificate chain was structurally valid. The failure was in the private key's entropy. Key generation ceremonies need explicit checks on the generated values, not just on the HSM's certification.

**2. Trust stores are inventory items.** Most organizations can list their servers but not their CA bundles. If you cannot answer "which trust store does this workload use?", you cannot answer whether it is patched.

**3. Revocation is not a universal control.** CRLSets and OneCRL are excellent for browsers. They do nothing for a Go binary, a Python daemon or an embedded device with a frozen bundle.

**4. The long tail outlives the incident.** The certificates expire in 2039. Devices that cannot be updated will keep trusting the chain until then, unless the root is removed or the device is replaced.

**5. AI is changing both sides.** The weakness was found and exploited with AI-assisted tooling, and the recovery of the keys took seconds. The same capability that makes weak keys easier to find also makes incident response faster, but only if the inventory and patch paths already exist.

## References

- Cloudflare, [8 eMudhra certificates are compromised. Here's what you need to know](https://blog.cloudflare.com/emudhra-certificate-compromise)
- Mozilla Security Blog, [Protecting Firefox users following the compromise of eMudhra intermediate certificates](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/)
- The Hacker News, [Eight eMudhra CA Keys Compromised, Triggering Emergency Fixes Across Browsers and Software](https://thehackernews.com/2026/10/eight-emudhra-ca-keys-compromised.html)
- Scott Helme, [Eight Bits of Trust; eMudhra's CA keys cracked in milliseconds](https://scotthelme.co.uk/eight-bits-of-trust-emudhras-ca-keys-cracked-in-milliseconds/)
- eMudhra, [Statement on Recent Certificate Security Incident](https://emudhra.com/en/post/certificate-security-incident)
- Dennis Jackson, [affected certificate list and client test page](https://emudhra.we-have-a-problem.com/)
- Red Hat, [RHSB-2026-012 Certificate compromise - eMudhra](https://access.redhat.com/security/vulnerabilities/RHSB-2026-012)
- Ubuntu, [USN-8944-1](https://ubuntu.com/security/notices/USN-8944-1) and [USN-8944-2](https://ubuntu.com/security/notices/USN-8944-2)
- Debian, [DSA-6572-1](https://security-tracker.debian.org/tracker/DSA-6572-1)
- Go, [issue #82345](https://github.com/golang/go/issues/82345)
- Python Packaging Authority, [Information for Python users regarding the eMudhra / emSign CA incident](https://discuss.python.org/t/information-for-python-users-regarding-emudhra-emsign-ca-certificate-security-incident/109576)
- CERT-In, [CIAD-2026-0050](https://www.cert-in.org.in/s2cMainServlet?pageid=PUBVLNOTES02&VLCODE=CIAD-2026-0050)
