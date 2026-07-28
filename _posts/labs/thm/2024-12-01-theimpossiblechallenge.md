---
layout: default
title: The Impossible Challenge - TryHackMe room Writeup
description: TryHackMe Impossible Challenge walkthrough — steganography techniques to hidden data in images and extract flags using command-line tools.
category: thm
tags: [ctf, thm, steg]
---

# The Impossible Challenge

- [Overview](#overview)
- [Tools](#tools)
- [Task 1](#task-1)
- [Key Takeaways](#key-takeaways)

Room Link: [https://thm.com/room/theimpossiblechallenge](https://thm.com/room/theimpossiblechallenge)

## Overview

The Impossible Challenge is a steganography-focused room that tests your ability to find hidden data embedded in seemingly normal content. Steganography is the practice of concealing information within non-secret files — images, audio, text — without obvious visual changes. This room uses multiple encoding layers and zero-width character techniques to hide flags in plain sight.

## Tools

- [Cryptography Decoder](https://gchq.github.io) — GCHQ's interactive cipher tool for decoding various encryption schemes (ROT13, ROT47, Base64, hex, and more)
- [Zero Width Decoder](https://330k.github.io/misc_tools/unicode_steganography.html) — Decodes zero-width Unicode characters that are invisible but carry hidden data

## Task 1

1. The challenge provides a zip file, but it is password-protected. You need to find the password before you can extract the flag.

2. The main page contains an encoded hash. Using the GCHQ Cryptography Decoder, apply the following transformations in sequence:

   - **ROT13** — shifts each letter by 13 positions in the alphabet
   - **ROT47** — shifts ASCII characters by 47 positions
   - **Hex decode** — converts hexadecimal pairs to ASCII
   - **Base64 decode** — decodes Base64-encoded strings

   After decoding through these layers, you get the hint: `It's inside the text, in front of your eyes!`

3. The hint tells you to look at the **source code** of the page. Inspecting the HTML reveals unusual Unicode characters embedded around the word "Hmm". These are **zero-width characters** — Unicode code points like U+200B (zero-width space), U+200C (zero-width non-joiner), and U+200D (zero-width joiner) that are invisible when rendered but carry data.

4. Copy the zero-width text and decode it using the [Zero Width Decoder](https://330k.github.io/misc_tools/unicode_steganography.html). This reveals the password: `Password is *******`.

5. Use the extracted password to unzip the file and retrieve the flag.

## Key Takeaways

- **Multi-layer encoding** — Real-world steganography often uses multiple encoding layers (ROT13, hex, Base64) to obscure data. Always try decoding through several methods sequentially.
- **Zero-width characters** — Unicode contains invisible characters that can store hidden data. This technique is used in CTF challenges, real-world data exfiltration, and even watermarking. Always inspect HTML source code for unusual Unicode sequences.
- **Source code inspection** — Browsers render HTML visually, but the source code often contains hidden information. Right-click → View Page Source is one of the first things to check in web challenges.

