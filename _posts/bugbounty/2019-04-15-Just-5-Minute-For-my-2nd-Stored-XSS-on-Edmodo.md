---
layout: default
title: Just 5 minute to get my 2nd stored XSS on Edmodo.com
category: bugbounty
---

# Just 5 minute to get my 2nd stored XSS on Edmodo.com

- [How I Got the Bug?](#how-i-got-the-bug?)
- [PoC Video](#poc-video)
- [Twitter Status](#twitter-status)
- [Timeline](#timeline)

<img src="./img/2a.jpeg?raw=true" width="80%" alt="1 cool T-shirt + 1 shaker + 10 badges + 3 i love edmodo magnets">

## How I Got the Bug?
My overall experience with edmodo is good. They give quick response + cool swag + lots of input fields to test.
This time it was not planned. I was trying on many programs. 
Suddenly I opened edmodo and this time it redirected to new.edmodo.com. 
I posted my xss polyglot (as described on <a href="./1.html">my first write up</a>) on created school. 
This time I posted payloads on poll. 
Then I clicked on my dp to open my profile and it redirected me to <a href="www.edmodo.com">www.edmodo.com/*</a>. 
On this domain, there was some notification. When, I clicked notification and boom. It’s there.
Notification is not sanitized. Got another swag.

## PoC Video

<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/qsRTDMfzD24" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen>
</iframe>

## Twitter Status

<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark">
    <p lang="en" dir="ltr">
        <a href="https://twitter.com/ZishanAdThandar/status/1095650287065260032"></a>
    </p>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Timeline

<p>Reported on 31st January, 2019<br>
Rewarded on 4th February, 2019<br>
Swag received on 13th February, 2019</p>


Author: [Zishan Ahamed Thandar](https://ZishanAdThandar.github.io)
