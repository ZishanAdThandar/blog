---
layout: default
title: "Just 5 Minutes to My 2nd Stored XSS on Edmodo.com"
date: 2019-04-15
categories: bugbounty
tags: [edmodo, xss, bug-bounty, swag, notification-xss]
description: "How I found my second stored XSS on Edmodo.com in just 5 minutes by testing notification systems"
author: Zishan Ahamed Thandar
---

# Just 5 Minutes to My 2nd Stored XSS on Edmodo.com

- [How I Got the Bug?](#how-i-found-the-bug)
    - [The Accidental Discovery](#the-accidental-discovery)
    - [The Testing Process](#the-testing-process)
    - [The Vulnerability](#the-vulnerability)
- [Key Takeaways for Bug Hunters](#key-takeaways-for-bug-hunters)
- [Video Proof of Concept](#video-proof-of-concept)
- [Twitter Status](#twitter-status)
- [Timeline](#timeline)

<img src="https://raw.githubusercontent.com/ZishanAdThandar/blog/refs/heads/main/_posts/bugbounty/img/2a.png" width="80%" alt="1 cool T-shirt + 1 shaker + 10 badges + 3 i love edmodo magnets">

## How I Found the Bug

My overall experience with Edmodo has been excellent. They provide:
- ⚡ **Quick responses** to security reports
- 🎁 **Cool swag** (just look at that haul!)
- 🔍 **Lots of input fields** to test (perfect for hunters)

### The Accidental Discovery

This time, it wasn't planned. I was bouncing between different bug bounty programs when I decided to check Edmodo again. 

Suddenly, I noticed something different - I was redirected to **new.edmodo.com**. A new subdomain means new attack surface! 🎯

### The Testing Process

1. **Posted my XSS polyglot** on new school creation
2. **Tested the poll feature** with various payloads
3. **Clicked my profile picture** - redirected to `www.edmodo.com/*`
4. **Noticed notifications** on this domain
5. **Clicked a notification** and... **BOOM!** 💥

### The Vulnerability

The notification system wasn't sanitizing user input. When I clicked on a notification containing my payload, it executed in the context of `www.edmodo.com`.

> 💡 **Key Takeaway:** Always test notification systems, profile views, and cross-subdomain interactions!

## Key Takeaways for Bug Hunters

1. **Test new subdomains immediately** - new.edmodo.com led to this find
2. **Don't ignore notification features** - they often handle user input poorly
3. **Cross-subdomain testing** - my payload worked across different edmodo domains
4. **Re-use successful payloads** - that same polyglot worked twice!


## Video Proof of Concept

<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/qsRTDMfzD24" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen>
</iframe>

## Twitter Status

[![Twitter Status](https://raw.githubusercontent.com/ZishanAdThandar/blog/refs/heads/main/_posts/bugbounty/img/2b.png)](https://twitter.com/ZishanAdThandar/status/1095650287065260032)

## Timeline

- 🐛 XSS Reported to Edmodo on 31st January, 2019
- ✅ Triaged and rewarded on 4th February, 2019
- 🎁 Swag received on 13th February, 2019


