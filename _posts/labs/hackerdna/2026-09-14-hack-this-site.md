---
layout: post
title: 'Hack This Site - Client-Side Credential & Obscured Flag Extraction'
description: "CTF writeup defeating a SecureVault access control system whose credentials and flag are hardcoded in obfuscated client-side JavaScript, reversed with byte decoding."
category: hackerdna
tags: [web, ctf, hackerdna, client-side, javascript, obfuscation, source-review, credentials-in-js]
---

## Hack This Site - CTF Writeup

**Category:** WEB | **Flags:** 1

Challenge: [https://hackerdna.com/labs/hack-this-site](https://hackerdna.com/labs/hack-this-site)

## Contents

- [Reconnaissance](#reconnaissance)
- [JS Deobfuscation](#js-deobfuscation)
- [Flag](#flag)

## Reconnaissance

The lab serves a "SecureVault - Access Control System" on a shared host
(`lab.hdna.me`). The login form uses `onsubmit="return false;"` - authentication is
handled entirely by client-side JavaScript rather than a server, so the "access
control" lives in the browser. Viewing source is the attack surface.

## JS Deobfuscation

The page embeds a single obfuscated script. Two data structures stand out:

```javascript
var _0x2e5b = {
  '\x75\x73\x65\x72': '\x61\x64\x6d\x69\x6e',
  '\x70\x61\x73\x73': '\x37\x66\x33\x61\x39\x63\x32\x65\x31\x62\x35\x64\x38\x66\x34\x61'
};
```

Hex-decoded, these become:

```
user: admin
pass: 7f3a9c2e1b5d8f4a
```

The `validateAccess()` function compares the lowercased username input against
`admin` and the password against `7f3a9c2e1b5d8f4a`. If both match, it calls
`grantAccess()`, which displays the flag:

```javascript
var _0x7d4c = '102,52,97,52,100,101,97,56,45,99,51,100,53,45,52,100,48,55,45,56,50,52,100,45,50,52,97,97,50,97,48,100,102,56,101,101';
return _0x7d4c.split(',').map(function(c){
  return String.fromCharCode(parseInt(c, 10));
}).join('');
```

Each number is a character code. Decoding the array:

```python
print(''.join(chr(c) for c in flag_array))
# f4a4dea8-c3d5-4d07-824d-24aa2a0df8ee
```

**Flag:** `f4a4dea8-c3d5-4d07-824d-24aa2a0df8ee`

## How the Attack Works

The entire authentication and flag is baked into files shipped to the browser. The
flag string was first hex-encoded, then each character turned into its decimal ASCII
code and split into a comma-delimited string. This "obfuscation" gives the illusion of
protection while the actual values are recoverable in seconds. Because the check is
client-side, logging in is optional - the flag is already present in the source.

## Key Takeaways

- **Never perform access control in the browser.** Client-side checks are cosmetic.
  Any secret the client receives can be extracted - server-side enforcement is the
  only real control.
- **Hex/char-code obfuscation is not encryption.** Encoding `faa4...` as
  `102,52,97,...` only hides it from casual `Ctrl+F`, not from analysis.
- **View source first** on client-side challenges and "JS auth" apps; credentials and
  secrets are the first thing to look for.
- **Always decrypt/iterate quick wins** - `hex`, base64, char-code arrays and
  `atob()` are the most common hiding places in client-side CTF code.