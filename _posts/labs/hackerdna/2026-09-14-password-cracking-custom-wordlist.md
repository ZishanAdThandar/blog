---
layout: post
title: "Password Cracking - Custom Wordlist - OSINT to MD5 to Portal to ZIP"
description: "CTF writeup building a custom wordlist from a game studio's own website to crack unsalted MD5 hashes from a leaked forum export, using password reuse to reach the internal portal and a protected vault.zip, then zip2john to open the final archive."
category: hackerdna
tags: [crypto, ctf, hackerdna, password-cracking, custom-wordlist, prince, osint, md5, zip2john, password-reuse]
---

## Password Cracking - Custom Wordlist - CTF Writeup

**Category:** CRYPTO / WEB | **Flags:** 2 (User / Root)

Challenge: [https://hackerdna.com/labs/password-cracking-custom-wordlist](https://hackerdna.com/labs/password-cracking-custom-wordlist)

## Contents

- [Reconnaissance](#reconnaissance)
- [OSINT: Building the Custom Wordlist](#osint-building-the-custom-wordlist)
- [Cracking Unsalted MD5](#cracking-unsalted-md5)
- [Password Reuse & the Portal](#password-reuse--the-portal)
- [The Vault: zip2john](#the-vault-zip2john)

## Reconnaissance

The lab drops us into `Bitmarmot Games`, a fictional four-person studio:
Mika (art lead), Otso (founder/engineer), Dre (audio), and Yuki (QA/marketing).
The tags give the playbook up front: **OSINT, custom wordlist, PRINCE mode,
John the Ripper, zip2john, MD5, password reuse**.

Public pages: `/`, `/team`, `/devlog`, and `/portal` (a login form).
`robots.txt` points at two restricted areas:

```
User-agent: *
Disallow: /backup/
Disallow: /portal
```

## OSINT: Building the Custom Wordlist

`/backup/` is open. It holds a leftover forum database export and a note:

```
$ ls /backup/
forum-users.sql   README.txt
```

The SQL export contains four stale account records with **unsalted MD5** hashes
and no useful salts:

```
mika | 3cae506366d8b76f692f98718e6544bf
otso | 00d412713bb605c542bfb317c902ba95
dre  | 855bb11c314961d6a01cf1e02ec63144
yuki | e21e979d25de86b7e0e593cc08512cd7
```

A devlog entry ("Retiring the forum") says Yuki exported the accounts and begs
everyone to *"please make it a different one this time"* - a password-reuse
tell. Nothing in here will match `rockyou`: the passwords are assembled from
clues on the studio's own pages.

Digging through `/team` and `/devlog` produces rich word material:

- **Names:** Mika Sundstrom, Otso Rinne, Dre Okafor, Yuki Tanaka
- **Pets:** Bagel (Mika's cat), Pepper (Otso's dog)
- **Desk items:** tablet, cold matcha, banjo, three sound chips, soldering iron, coffee, chalk bag, instant ramen
- **Games / engine:** Turnip Knight, Radish Rally, Root Cellar, the Burrow engine
- **Studio words:** Bitmarmot, marmot, garage, chiptune, sprite, mascot

I tokenized those pages into a seed list (names, pets, desk items, game names,
studio jargon) as the raw material:

```
mika otso dre yuki sundstrom rinne okafor tanaka
bagel pepper matcha tablet banjo coffee soldering
chiptune chips sound chalk ramen
turnip knight radish rally root cellar bitmarmot burrow marmot
engine sprite mascot garage vegetable ...
```

## Cracking Unsalted MD5

The first hit falls out immediately with John and a rule stack, because the
passwords follow the studio's own naming conventions:

```bash
john --format=raw-md5 --wordlist=seed.txt --rules=All md5.txt
```

```
3cae506366d8b76f692f98718e6544bf:Turnipknight
```

`mika`'s password is `Turnipknight` - `Turnip Knight`, the very game she art-led,
stripped of its space. One hash down. The remaining three need more chaining, so
`1^2+2+1+2^3+3^3` (PRINCE mode) over the seed list is the natural next step.

## Password Reuse & the Portal

`/portal` says "Studio accounts only - lost your password? Ask Otso." A forum
password reused against the portal is exactly the play:

```bash
curl -s -d 'username=mika&password=Turnipknight' http://TARGET/portal -L
```

A `302` with `Set-Cookie: session=...` confirms login. The authenticated
portal page returns the first flag:

```
>>> USER FLAG: 5cee426d-b9f1-456b-b785-f49c59a815cd <<<
```

And it surfaces a new resource: Otso's hand-rolled backups, protected -
`/portal/backups` → `/portal/download/vault.zip`.

## The Vault: zip2john

`vault.zip` is a traditional encrypted archive. Convert it for John and crack
with the custom wordlist (PRINCE / rules handle the concatenated form):

```bash
zip2john vault.zip > vault.zip.john
john --format=PKZIP --wordlist=big_wl.txt --rules=All vault.zip.john
```

```
Pepperbanjo1     (vault.zip)
```

`Pepperbanjo1` - Otso's dog plus the banjo he plays. Extracting:

```bash
7z x -p'Pepperbanjo1' vault.zip
```

```
handover.txt
flag-root.txt
```

`handover.txt` is the (back)story - the Burrow repo, Radish Rally shelved as
"never fun". `flag-root.txt` holds the root flag:

```
ROOT FLAG: 5dae00be-d452-4897-9037-d08175a5f83e
```

## How the Attack Works

1. **Public pages leak a full personal vocabulary** - pets, desk items, game
   names. That becomes a custom wordlist no generic list contains.
2. **Unsalted MD5** is trivially brute-forced once the candidate space is
   right; the passwords were simply never in any public corpus.
3. **Password reuse** bridged the dead forum accounts to the live studio
   portal.
4. **The portal granted the protected archive**, and `zip2john` turned the
   vault into a crackable format for John.

## Key Takeaways

- **Custom wordlists beat rockyou for post-leak passwords.** Whitepace-split,
   capitalize, and chain the story's own words - games, pets, desk items -
   and PRINCE/rules do the heavy lifting.
- **Unsalted MD5 is a museum piece.** Use `bcrypt/argon2` with a salt; every
   leaked database table like this are free password guesses.
- **Password reuse is the enabler.** One forgotten forum login is all it
   takes to reach an internal portal.
- **zip2john + John** is the standard pipeline for encrypted archives -
   never try to guess a ZIP password by hand.