---
layout: default
title: Hunting methodology and experience of my First Stored XSS on Edmodo.com
category: Bug Bounty
---

# Hunting methodology and experience of my First Stored XSS on Edmodo.com


- [What is my methodology?](#what-is-my-methodology?)
- [How I got the bug?](#how-i-got-the-bug?)
- [How I got the payload?](#how-i-got-the-payload?)
- [Twitter Status](#twitter-status)
- [Experience with Edmodo](#experience-with-edmodo)
- [Timeline](#timeline)

There are many people sharing images of Edmodo swag. It looks cool and everyone says that, it is cross site scripting bug. So, I assumed there is lots of XSS. Edmodo is a very secure platform and edmodo is very serious about security, so I decided to hunt . Even leet hunter Prial Islam Khan shared image of his edmodo swag, that inspired me a lot.

<img src="./img/1a.png" alt="Screenshot from https://prial.me/acknowledgements.html">

So, I decided to test Edmodo. But, I am a newbie. How can I find the bug? yeah, I can. If I can that means anyone can.

<h2>What is my methodology?</h2>
Is that simple steps or any l33ty automation tool. Nope, it’s just manual.. too manual. 
As I said, I am a newbie.. so tried very noob way to hunt. I filled all fields with XSS payloads with hope to get an XSS and cool swag ❤.

<h2>How I got the bug?</h2>
As I said all fields are filled with XSS. I was hoping for the pop up and got nothing. But, hope (believe) is always there with me. I read
Arbaz Hussain’s ( <a href="https://hackerone.com/kiraak-boy">kiraak-boy</a>) post, where he advised to give time to all program before loosing hope. 

Link to the post: 
<a href="https://medium.com/@arbazhussain/10-rules-of-bug-bounty-65082473ab8c">https://medium.com/@arbazhussain/10-rules-of-bug-bounty-65082473ab8c</a> 

So, I decided to start finding bugs on edmodo subdomains. 
I used a tool named <a href="https://github.com/aboul3la/Sublist3r">sublist3r</a> (coded by Ahmed Aboul-ela) to find subdomains. 

Link to the tool: <a href="https://github.com/aboul3la/Sublist3r">https://github.com/aboul3la/Sublist3r</a>

Then? then I just opened beta.edmodo.com and boom XSS popped. I started to find the injection point and it’s on the status post.

<h2>How I got the payload?</h2>
May be people are thinking, even some people already asked me about the payload I used.. It’s not mine. I used an XSS polyglot crafted by XSS King Ashar Javed. 
Here is the payload,

```javascript

">><marquee><img src=x onerror=confirm(1)></marquee>" ></plaintext\></|\><plaintext/onmouseover=prompt(1) ><script>prompt(1)</script>@gmail.com<isindex formaction=javascript:alert(/XSS/) type=submit>'-->" ></script><script>alert(1)</script>"><img/id="confirm&lpar; 1)"/alt="/"src="/"onerror=eval(id&%23x29;>'"><img src="http: //i.imgur.com/P8mL8.jpg"> 
```

I used this payload initially then removed unnecessary parts while making PoC video.

<h2>Twitter Status</h2>

https://twitter.com/ZishanAdThandar/status/1045959846535856128

<a href="https://twitter.com/ZishanAdThandar/status/1045959846535856128"><img src="./img/1b.png?raw=true" width="80%" alt="Twitter Status"></a>

Note: This is my first medium post. So, feel free to comment to give advice about this write up and correct me (even grammar mistakes). btw, the bug was found long time ago, so I described methodology from my memory.

<h2>Experience with Edmodo</h2>
Edmodo is very secure platform and very serious about security. I have great experience with edmodo. There response is quick and communication is clear. Thanks edmodo (Specially Chip Benson).
<h2>Video PoC (also follow my youtube channel for updates)</h2> 

https://www.youtube.com/embed/izeXqGpYEx8

<h2>Timeline</h2>
XSS Reported on 16 September, 2018<br>
Triaged and rewarded on 17 September, 2018<br>
Swag received on 29 September, 2018


Read my <a href="./2.md">2nd XSS on edmodo writeup</a>.
    
Author: [Zishan Ahamed Thandar](https://ZishanAdThandar.github.io)
