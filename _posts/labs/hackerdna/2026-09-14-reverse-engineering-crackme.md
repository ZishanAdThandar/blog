---
layout: post
title: "Reverse Engineering - License Key Crackme"
description: "CTF writeup static-analyzing an ARM64 aarch64 license activation client, XOR-decoding an embedded encrypted flag from g_token_enc, reverse-engineering derive_key to forge the admin license, and activating an admin account to receive the root flag."
category: hackerdna
tags: [re, ctf, hackerdna, reverse-engineering, crackme, aarch64, arm64, license-key, static-analysis]
---

## Reverse Engineering: License Key Crackme - CTF Writeup

**Category:** REVERSING | **Flags:** 2 (User / Root)

Challenge: [https://hackerdna.com/labs/reverse-engineering-crackme](https://hackerdna.com/labs/reverse-engineering-crackme)

## Contents

- [Reconnaissance](#reconnaissance)
- [Static Analysis: The ARM64 Binary](#static-analysis-the-arm64-binary)
- [Recovering the User Flag](#recovering-the-user-flag)
- [Reverse-Engineering derive_key](#reverse-engineering-derive_key)
- [Forging the Admin License](#forging-the-admin-license)

## Reconnaissance

The web service is **Sentinel License Manager**. It provides a download of the
offset activation client and documents the CLI contract:

```bash
./sentinel-activate --account <name> --key <SENT-XXXX-XXXX-XXXX>
```

A demo trial:
- Account: `trial`
- License key: `SENT-3B00-1C47-EF00`

The binary is an **aarch64 (ARM64) ELF**, not stripped, with useful symbols:

```
decode_token   4140
derive_key     4140
validate       4140
main           4140
g_token_enc    36-byte object in .rodata
```

## Static Analysis: The ARM64 Binary

Load it with a disassembler that understands ARM64. The relevant functions:

- `decode_token(buf)` — XORs each byte of `g_token_enc` with `0x5A`.
- `derive_key(account, out)` — builds the `SENT-XXXX-XXXX-XXXX` key from an
  account name.
- `validate(account, key)` — derives the expected key and compares it
  (case-insensitively) with the user-provided key.
- `main` — parses `--account`, `--key`, and a hidden `--diag`.

## Recovering the User Flag

`main`'s `--diag` branch calls `decode_token` then prints straight from
`g_token_enc`:

```c
"User Flag: %s\n"   // 0x400d60
```

`g_token_enc` (36 bytes at `0x400cc0`):

```
62 63 3b 3c 6c 6e 3c 6d 77 38 39 38 3e 77 6e 63
6a 3b 77 62 6f 6e 68 77 3f 38 6f 3e 3f 6a 3f 3e
6e 6c 39 3f
```

XOR each byte with `0x5A`:

```bash
python3 -c "
tok=bytes.fromhex('62633b3c6c6e3c6d773839383e776e636a3b77626f6e68773f386f3e3f6a3f3e6e6c393f')
print(bytes(b^0x5a for b in tok).decode())
"
```

```
USER FLAG: 89af64f7-bcbd-490a-8542-eb5de0ed46ce
```

## Reverse-Engineering derive_key

`derive_key` initializes a 6-byte accumulator to zero, then for each
character of the account name computes:

```python
n = len(account)
out = [0]*6
j = 0
for i, ch in enumerate(account_bytes):
    b = ch
    t = ((b & 0x7f) << 1) + b      # ubfiz + add
    b = (t + ((t & 0x1f) << 3)) & 0xff
    b = (b + 0x3d) & 0xff
    b ^= 0x47
    b = (b + i) & 0xff
    b ^= n
    out[j] ^= b
    j = (j + 1) % 6
```

The 6 accumulator bytes are rendered as 12 hex nibbles (using the
`0123456789ABCDEF` table) and formatted with
`SENT-%c%c%c%c-%c%c%c%c-%c%c%c%c`.

Implementing exactly that and checking against the documented demo key is the
sanity check:

```
'trial'  -> SENT-3B00-1C47-EF00   (matches the site's trial license!)
```

## Forging the Admin License

The site says premium modules are reserved for the `admin` account. Compute the
admin key the same way:

```
'admin'  -> SENT-3A8A-F81F-9100
```

Submitting it to the web activation endpoint:

```bash
curl -s "http://TARGET/activate" -X POST \
  -d "account=admin&license_key=SENT-3A8A-F81F-9100"
```

```json
{
  "account": "admin",
  "message": "Premium license activated. All modules unlocked.",
  "root_flag": "f8694e5c-efef-4272-83c2-1101cfad5fd3",
  "status": "success",
  "tier": "premium"
}
```

**Root Flag:** `f8694e5c-efef-4272-83c2-1101cfad5fd3`

## How the Attack Works

1. **Hardcoded secrets** — an encrypted user flag (`g_token_enc`) is embedded
   in the binary under a trivial XOR.
2. **Deterministic key generation** — `derive_key` is a pure function of the
   account name with no server randomness, so any account's license can be
   computed offline.
3. **Trusted client = trusted gate** — the web backend accepts whatever key
   the client says is valid and unlocks "admin" with a handful of AArch64
   instructions reversed.

## Key Takeaways

- **Treat client-side logic as public.** Any secret in a binary is recoverable;
   XOR obfuscation is security theater.
- **License keys with no HSM/offline signature** derived from a static
   algorithm can always be forged. Use asymmetric signatures validated
   server-side.
- **ARM64 reversing** is just like x86 once the calling convention (x0-x7,
   w0-w31, x29/x30) is clear — include the little-endian `.rodata` and
   `UBFIZ/UBFX` bit tricks.
- Always validate a reverse engineered algorithm against a known-good example
   (here the `trial` key) before trusting it.