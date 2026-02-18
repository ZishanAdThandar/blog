---
layout: default
title: Just 5 minute to get my 2nd stored XSS on Edmodo.com
category: Bug Bounty
---

# Just 5 minute to get my 2nd stored XSS on Edmodo.com

- [How I Got the Bug?](#how-i-got-the-bug?)
- [PoC Video](#poc-video)
- [Twitter Status](#twitter-status)
- [Timeline](#timeline)

<img src="./img/2a.jpeg?raw=true" width="80%" alt="1 cool T-shirt + 1 shaker + 10 badges + 3 i love edmodo magnets">

<h2>How I Got the Bug?</h2>
My overall experience with edmodo is good. They give quick response + cool swag + lots of input fields to test.
This time it was not planned. I was trying on many programs. 
Suddenly I opened edmodo and this time it redirected to new.edmodo.com. 
I posted my xss polyglot (as described on <a href="./1.html">my first write up</a>) on created school. 
This time I posted payloads on poll. 
Then I clicked on my dp to open my profile and it redirected me to <a href="www.edmodo.com">www.edmodo.com/*</a>. 
On this domain, there was some notification. When, I clicked notification and boom. It’s there.
Notification is not sanitized. Got another swag.

<h2>PoC Video</h2>
https://www.youtube.com/embed/qsRTDMfzD24

<h2>Twitter Status</h2>
<a href="https://twitter.com/ZishanAdThandar/status/1045959846535856128"><img src="./img/2b.png?raw=true" width="80%" alt="Twitter Status"></a>

<h2>Timeline:</h2>
<p>Reported on 31st January, 2019<br>
Rewarded on 4th February, 2019<br>
Swag received on 13th February, 2019</p>

Read my methodology on my <a href="./1.html">edmodo first writeup</a>

Author: [Zishan Ahamed Thandar](https://ZishanAdThandar.github.io)
