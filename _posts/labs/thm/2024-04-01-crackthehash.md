---
layout: default
title: CrackTheHash Writeup - TryHackMe room to learn hash cracking
description: TryHackMe CrackTheHash walkthrough — identifying hash types and cracking MD5, SHA1, NTLM, and bcrypt hashes using hashcat and online tools.
category: thm
tags: [thm, ctf, machine, crack, cryptography, hashcat]
---

# CrackTheHash

- [Overview](#overview)
- [Tools](#tools)
- [Level 1](#level-1)
- [Level 2](#level-2)
- [Key Takeaways](#key-takeaways)

Room Link: [https://thm.com/room/crackthehash](https://thm.com/room/crackthehash)

Badges: [https://thm.com/ZishanAdThandar/badges/hash-cracker](https://thm.com/ZishanAdThandar/badges/hash-cracker)

## Overview

CrackTheHash is a cryptography room focused on hash identification and cracking. Each challenge provides a hash, and you must identify the hash type and find the plaintext using tools like hashcat and online databases. This is a core skill in penetration testing — recovering passwords from leaked hashes is one of the most common real-world attack scenarios.

## Tools

- **hashcat** — GPU-accelerated password recovery tool supporting hundreds of hash types
- **hashid** — Python tool for identifying hash types based on length and format
- **hash-identifier** — Another hash identification tool
- **rockyou.txt** — Classic password wordlist with 14 million entries

## Level 1

For each hash, the workflow is: identify the hash type with `hashid`, then crack it with `hashcat` using the correct mode flag.

**Hash 1:** `48bb6e862e54f2a795ffc4e541caed4d`
- Identified as MD5 (32 hex characters)
- Cracked with: `hashcat -m 0 hash.txt rockyou.txt`
- Alternatively, a quick Google or MD5 lookup site reveals the plaintext instantly

**Hash 2:** `CBFDAC6008F9CAB4083784CBD1874F76618D2A97`
- `hashid` identifies SHA1 (40 hex characters)
- Cracked with: `hashcat -m 100 hash.txt rockyou.txt`

**Hash 3:** `1C8BFE8F801D79745C4631D09FFF36C82AA37FC4CCE4FC946683D7B336B63032`
- `hashid` identifies SHA256 (64 hex characters)
- Cracked with: `hashcat -m 1400 hash.txt rockyou.txt`

**Hash 4:** `$2y$12$Dwt1BZj6pcyc3Dy1FWZ5ieeUznr71EeNkJkUlypTsgbX1H68wsRom`
- Starts with `$2y$` — this is bcrypt (Blowfish). The `$2y$` prefix indicates the crypt variant
- Cracked with: `hashcat -m 3200 hash.txt rockyou.txt`
- Note: bcrypt is intentionally slow. Cracking takes significantly longer than MD5 or SHA families

**Hash 5:** `279412f945939ba78ce0758d3fd83daa`
- `hashid` shows multiple possibilities: MD5, MD2, MD4
- Testing with hashcat: MD4 (`-m 900`) was the correct type
- This demonstrates why hash identification isn't always straightforward — identical hash lengths can represent different algorithms

## Level 2

Level 2 introduces salts and more complex hash formats.

**Hash 1:** `F09EDCB1FCEFC6DFB23DC3505A882655FF77375ED8AA2D1C13F640FCCC2D0C85`
- Identified as SHA256
- Cracked with: `hashcat -m 1400 hash.txt rockyou.txt`

**Hash 2:** Identified as NTLM (used in Windows authentication)
- Cracked with: `hashcat -m 1000 hash.txt rockyou.txt`
- NTLM hashes are unsalted and fast to crack, making them a common target in Windows environments

**Hash 3:** Starts with `$6$` — this is SHA512crypt (Linux crypt format)
- The `$6$` prefix followed by a salt indicates SHA512-based hashing
- Cracked with: `hashcat -m 1800 hash.txt rockyou.txt`

**Hash 4:** `e5d8870e5bdd26602cab8dbe07a942c8669e56d6`
- `hashid` identifies SHA1 with a salt
- The format is `hash:salt`, so the command uses both: `hashcat -m 1600 "e5d8870e5bdd26602cab8dbe07a942c8669e56d6:thm" rockyou.txt`

## Key Takeaways

- **Hash identification is step one** — Use `hashid` or `hash-identifier` to determine the algorithm. Look for telltale prefixes: `$2y$` = bcrypt, `$6$` = SHA512crypt, 32 chars = MD5, 40 chars = SHA1.
- **Salted hashes are harder** — Salts prevent rainbow table attacks. You need the salt value and a wordlist-based approach (like hashcat) to crack them.
- **Hashcat mode flags** — Each hash type has a specific mode number (`-m`). Getting the mode wrong means hashcat can't crack it. Common modes: 0 (MD5), 100 (SHA1), 1000 (NTLM), 1400 (SHA256), 3200 (bcrypt).
- **Speed varies dramatically** — MD5 and SHA1 crack in seconds. bcrypt is deliberately slow and may take hours or days depending on hardware.


