---
layout: default
title: "My First Stored XSS on Edmodo.com - Hunting Methodology"
date: 2019-03-13
description: "How I found my first stored XSS vulnerability on Edmodo.com using manual testing and subdomain enumeration. A beginner's journey to bug bounty."
categories: [bugbounty, xss, writeup]
tags: [edmodo, xss, bug-bounty, writeup]
---

# Hunting methodology and experience of my First Stored XSS on Edmodo.com


- [What is my methodology?](#what-is-my-methodology)
- [How I got the bug?](#how-i-got-the-bug)
- [How I got the payload?](#how-i-got-the-payload)
- [Twitter Status](#twitter-status)
- [Video Proof of Concept](#video-proof-of-concept)
- [Experience with Edmodo](#experience-with-edmodo)
- [Timeline](#timeline)

There are many people sharing images of Edmodo swag. It looks cool and everyone says it's a cross-site scripting bug. So, I assumed there were lots of XSS vulnerabilities. Edmodo is a very secure platform and they take security seriously, so I decided to hunt.

Even elite hunter **Prial Islam Khan** shared an image of his Edmodo swag, which inspired me a lot.

<img src="https://raw.githubusercontent.com/ZishanAdThandar/blog/refs/heads/main/_posts/bugbounty/img/1a.png" alt="Screenshot from https://prial.me/acknowledgements.html">

So, I decided to test Edmodo. But I'm a newbie. How can I find the bug? If I can, that means anyone can! 

## What is my methodology?

Is it simple steps or any l33t automation tool? Nope, it's just manual... **too manual**.

As a newbie, I tried a very noob way to hunt: I filled all fields with XSS payloads, hoping to get a popup and cool swag ❤️.

## How I got the bug?

I filled every field with XSS payloads, hoping for a popup, but got nothing. But **hope** (and believe) is always with me.

I read **Arbaz Hussain's** (<a href="https://hackerone.com/kiraak-boy">@kiraak-boy</a>) post, where he advised to give time to every program before losing hope.

📖 **Recommended Reading:**  
[10 Rules of Bug Bounty by Arbaz Hussain](https://medium.com/@arbazhussain/10-rules-of-bug-bounty-65082473ab8c)

So, I decided to start finding bugs on Edmodo subdomains. I used **Sublist3r** (coded by Ahmed Aboul-ela) to enumerate subdomains:

```bash
# Install Sublist3r
git clone https://github.com/aboul3la/Sublist3r.git
cd Sublist3r
pip install -r requirements.txt

# Find Edmodo subdomains
python sublist3r.py -d edmodo.com
```

🔗 **Tool Link:** [Sublist3r on GitHub](https://github.com/aboul3la/Sublist3r)

Then? Then I just opened **beta.edmodo.com** and... **BOOM!** 💥 XSS popped! I started investigating and found the injection point was in the **status post** feature.

## How I got the payload

People might be wondering about the payload I used. It's not mine - I used an **XSS polyglot** crafted by the legendary **Ashar Javed**.

Here's the payload I used:

```javascript
">><marquee><img src=x onerror=confirm(1)></marquee>" ></plaintext\></|\><plaintext/onmouseover=prompt(1) ><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>'-->" ></script><script>alert(1)</script>"><img/id="confirm&lpar; 1)"/alt="/"src="/"onerror=eval(id&%23x29;>'"><img src="http: //i.imgur.com/P8mL8.jpg">
```

> 💡 **Note:** I used this payload initially, then removed unnecessary parts while making the PoC video.

## Twitter Status

[![Twitter Status](https://raw.githubusercontent.com/ZishanAdThandar/blog/refs/heads/main/_posts/bugbounty/img/1b.png)](https://x.com/ZishanAdThandar/status/1045959846535856128")

🔗 **Direct Link:** [View on X/Twitter](https://x.com/ZishanAdThandar/status/1045959846535856128)

## Experience with Edmodo

Edmodo is a very secure platform and they take security seriously. I had a **great experience** with their security team. Their response was quick and communication was clear.

**Special thanks to Chip Benson** and the entire Edmodo security team!

## Video Proof of Concept

Check out the video PoC (and don't forget to subscribe to my YouTube channel for updates!): 

<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/izeXqGpYEx8" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen>
</iframe>


## Timeline

- 🐛 XSS Reported to Edmodo on 16 September, 2018
- ✅ Triaged and rewarded on 17 September, 2018
- 🎁 Swag received on 29 September, 2018


