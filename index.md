---
layout: default
title: Labs
description: Hands-on offensive security labs, walkthroughs, exploitation methodologies, and practical cybersecurity training environments.
permalink: /labs/
---

<section class="hero-section">

<div class="article-category">

<span>
Hack The Box
</span>

<span>
TryHackMe
</span>

<span>
OffSec
</span>

<span>
VulnHub
</span>

</div>

<h1 class="hero-title">

Hands-On Offensive Security Labs

</h1>

<p class="hero-description">

Practical exploitation walkthroughs,
privilege escalation methodologies,
Active Directory labs,
and real-world attack path practice
across multiple offensive security platforms.

</p>

</section>

<div class="posts-list">

<article class="post-item">

<div class="article-category">

<span>
HTB
</span>

</div>

<h2>

<a href="/blog/labs/htb/">

Hack The Box

</a>

</h2>

<div class="post-excerpt">

Windows and Linux machine walkthroughs,
enumeration methodologies,
privilege escalation,
and exploitation workflows.

</div>

<a
href="/blog/labs/htb/"
class="read-more"
>

Explore HTB

<i class="fas fa-arrow-right"></i>

</a>

</article>

<article class="post-item">

<div class="article-category">

<span>
THM
</span>

</div>

<h2>

<a href="/blog/labs/thm/">

TryHackMe

</a>

</h2>

<div class="post-excerpt">

Learning-focused offensive security labs,
web exploitation,
Active Directory,
and foundational cybersecurity exercises.

</div>

<a
href="/blog/labs/thm/"
class="read-more"
>

Explore THM

<i class="fas fa-arrow-right"></i>

</a>

</article>

<article class="post-item">

<div class="article-category">

<span>
OffSec
</span>

</div>

<h2>

<a href="/blog/labs/offsec/">

OffSec Labs

</a>

</h2>

<div class="post-excerpt">

OSCP-style methodologies,
advanced exploitation workflows,
and offensive security certification preparation.

</div>

<a
href="/blog/labs/offsec/"
class="read-more"
>

Explore OffSec

<i class="fas fa-arrow-right"></i>

</a>

</article>

<article class="post-item">

<div class="article-category">

<span>
VulnHub
</span>

</div>

<h2>

<a href="/blog/labs/vulnhub/">

VulnHub

</a>

</h2>

<div class="post-excerpt">

Classic vulnerable machines,
manual exploitation methodologies,
and practical penetration testing exercises.

</div>

<a
href="/blog/labs/vulnhub/"
class="read-more"
>

Explore VulnHub

<i class="fas fa-arrow-right"></i>

</a>

</article>

</div>

---

## Featured Technical Research

<div class="posts-list">

{% assign featured_posts =
site.posts | where: "pinned", true %}

{% if featured_posts.size > 0 %}

{% for post in featured_posts limit:3 %}

<article class="post-item">

<div class="article-category">

{% for category in post.categories %}

<span>

{{ category }}

</span>

{% endfor %}

</div>

<h2>

<a href="{{ post.url | relative_url }}">

{{ post.title }}

</a>

</h2>

<div class="post-excerpt">

{% if post.description %}

{{ post.description }}

{% else %}

{{ post.excerpt
| strip_html
| truncate: 220 }}

{% endif %}

</div>

<div class="post-meta">

<span>

<i class="fas fa-calendar"></i>

{{ post.date | date: "%B %d, %Y" }}

</span>

<span>

<i class="fas fa-clock"></i>

{% assign words =
post.content | number_of_words %}

{% assign readtime =
words | divided_by: 180 %}

{% if readtime < 1 %}

1 min read

{% else %}

{{ readtime }} min read

{% endif %}

</span>

</div>

<a
href="{{ post.url | relative_url }}"
class="read-more"
>

Read Article

<i class="fas fa-arrow-right"></i>

</a>

</article>

{% endfor %}

{% else %}

{% for post in site.posts limit:3 %}

<article class="post-item">

<div class="article-category">

{% for category in post.categories %}

<span>

{{ category }}

</span>

{% endfor %}

</div>

<h2>

<a href="{{ post.url | relative_url }}">

{{ post.title }}

</a>

</h2>

<div class="post-excerpt">

{% if post.description %}

{{ post.description }}

{% else %}

{{ post.excerpt
| strip_html
| truncate: 220 }}

{% endif %}

</div>

<div class="post-meta">

<span>

<i class="fas fa-calendar"></i>

{{ post.date | date: "%B %d, %Y" }}

</span>

<span>

<i class="fas fa-clock"></i>

{% assign words =
post.content | number_of_words %}

{% assign readtime =
words | divided_by: 180 %}

{% if readtime < 1 %}

1 min read

{% else %}

{{ readtime }} min read

{% endif %}

</span>

</div>

<a
href="{{ post.url | relative_url }}"
class="read-more"
>

Read Article

<i class="fas fa-arrow-right"></i>

</a>

</article>

{% endfor %}

{% endif %}

</div>

---

## Explore Research Areas

<div class="posts-list">

<article class="post-item">

<div class="article-category">

<span>
Research
</span>

</div>

<h2>

<a href="/blog/research/">

Research Notes

</a>

</h2>

<div class="post-excerpt">

Technical methodologies, Active Directory research,
Windows internals, privilege escalation,
and offensive security workflows.

</div>

<a
href="/blog/research/"
class="read-more"
>

Explore Research

<i class="fas fa-arrow-right"></i>

</a>

</article>

<article class="post-item">

<div class="article-category">

<span>
Bug Bounty
</span>

</div>

<h2>

<a href="/blog/bug-bounty/">

Bug Bounty

</a>

</h2>

<div class="post-excerpt">

Reconnaissance methodologies,
web exploitation workflows,
practical attack paths,
and real-world findings.

</div>

<a
href="/blog/bug-bounty/"
class="read-more"
>

Explore Bug Bounty

<i class="fas fa-arrow-right"></i>

</a>

</article>

<article class="post-item">

<div class="article-category">

<span>
Labs
</span>

</div>

<h2>

<a href="/blog/labs/htb/">

Labs & Walkthroughs

</a>

</h2>

<div class="post-excerpt">

Hack The Box,
TryHackMe,
OffSec,
and VulnHub walkthroughs
focused on methodology and exploitation.

</div>

<a
href="/blog/labs/htb/"
class="read-more"
>

Explore Labs

<i class="fas fa-arrow-right"></i>

</a>

</article>

</div>

---

## Latest Technical Notes

<div class="posts-list">

{% for post in site.posts limit:6 %}

<article class="post-item">

<div class="article-category">

{% for category in post.categories %}

<span>

{{ category }}

</span>

{% endfor %}

</div>

<h2>

<a href="{{ post.url | relative_url }}">

{{ post.title }}

</a>

</h2>

<div class="post-excerpt">

{% if post.description %}

{{ post.description }}

{% else %}

{{ post.excerpt
| strip_html
| truncate: 240 }}

{% endif %}

</div>

<div class="post-meta">

<span>

<i class="fas fa-calendar"></i>

{{ post.date | date: "%B %d, %Y" }}

</span>

<span>

<i class="fas fa-clock"></i>

{% assign words =
post.content | number_of_words %}

{% assign readtime =
words | divided_by: 180 %}

{% if readtime < 1 %}

1 min read

{% else %}

{{ readtime }} min read

{% endif %}

</span>

</div>

{% if post.tags %}

<div
class="article-category"
style="margin-top:1rem;"
>

{% for tag in post.tags limit:4 %}

<span>

#{{ tag }}

</span>

{% endfor %}

</div>

{% endif %}

<a
href="{{ post.url | relative_url }}"
class="read-more"
>

Read Article

<i class="fas fa-arrow-right"></i>

</a>

</article>

{% endfor %}

</div>
