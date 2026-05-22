---
layout: default
title: CrackTheHash Writeup - TryHackMe room to learn hash cracking
category: thm
tags: [thm, ctf, machine, crack, cryptography, hashcat]
---

# CrackTheHash

- [Tools](#tools)
- [Level 1](#level-1)
- [level 2](#level-2)

Room Link: [https://thm.com/room/crackthehash](https://thm.com/room/crackthehash)

Badges: [https://thm.com/ZishanAdThandar/badges/hash-cracker](https://thm.com/ZishanAdThandar/badges/hash-cracker)

## Tools 

- hashcat
- hashid
- hash-identifier
- rockyou.txt

## Level 1

- I googled the first hash `48bb6e862e54f2a795ffc4e541caed4d`. Found this link https://md5.gromweb.com/?md5=48bb6e862e54f2a795ffc4e541caed4d So, It is nd5 of string `easy`. Also running hashcat with `hashcat -D 2 -m 0 hash.txt rockyou.txt` gives is answer.
- Used `hashid` on second hash with `hashid CBFDAC6008F9CAB4083784CBD1874F76618D2A97` and it shows SHA1 as one of the probable hash. So, again runnning hashcat with `-m 100` gives us answer.
- Again used hashid on hash `1C8BFE8F801D79745C4631D09FFF36C82AA37FC4CCE4FC946683D7B336B63032`, it shows SHA256. So, used hashcat with `-m 1400` gives the answer.
- Again hash id method shows hash `$2y$12$Dwt1BZj6pcyc3Dy1FWZ5ieeUznr71EeNkJkUlypTsgbX1H68wsRom` is bcrypt blowfish. Similarly hashcat with `-m 3200` gives answer.
- hashid shows hash `279412f945939ba78ce0758d3fd83daa` could be md5, md2, md4 etc. After trying hashcat for different hash types, got the answer for md4 with `-m 900` give us answer.

## Level 2

- Again same method shows SHA256 and used hashcat with `-m 1400` shows hash `F09EDCB1FCEFC6DFB23DC3505A882655FF77375ED8AA2D1C13F640FCCC2D0C85` is encrypted from the asnwer.
- `hash-identifier` shows that hash cold be NTLM. So, used hashcat with `-m 1000` gives answer.
- As it is strating with `$6$`, so hash is `SHA512crypt`. So, it's decrypted with hashcat with `-m 1800` and the cracked hash is the answer.
- hashid shows hash `e5d8870e5bdd26602cab8dbe07a942c8669e56d6` is SHA1 with salt. So, decrypted "e5d8870e5bdd26602cab8dbe07a942c8669e56d6:thm" with salt SHA1 gives us the answer.


