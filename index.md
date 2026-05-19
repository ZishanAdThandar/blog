---
layout: default
title: Offensive Security Research
description: Offensive security research, Active Directory methodologies, bug bounty workflows, practical lab writeups, and hands-on cybersecurity notes.
---

<section class="hero-section">

<div class="article-category">

<span>
Offensive Security
</span>

<span>
Research
</span>

<span>
Bug Bounty
</span>

<span>
Active Directory
</span>

</div>

# Offensive Security Research & Practical Cybersecurity Notes

Practical offensive security methodologies, Active Directory research,
bug bounty workflows, hands-on lab writeups, and real-world technical notes.

<div style="margin-top: 2rem; display:flex; gap:1rem; flex-wrap:wrap;">

<a href="/blog/research/" class="btn btn-premium">

<i class="fas fa-book"></i>

Research

</a>

<a href="/blog/labs/htb/" class="btn">

<i class="fas fa-terminal"></i>

Labs

</a>

</div>

</section>

---

## Featured Research

<div class="posts-list">

{% assign featured_posts =
site.posts | where: "pinned", true %}

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

</div>

---

## Research Categories

<div class="posts-list">

<article class="post-item">

<h2>

<a href="/blog/research/">

Research

</a>

</h2>

<div class="post-excerpt">

Technical research notes, methodologies,
Active Directory techniques, Windows internals,
web security, and offensive security workflows.

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

<h2>

<a href="/blog/bug-bounty/">

Bug Bounty

</a>

</h2>

<div class="post-excerpt">

Practical web exploitation notes,
reconnaissance methodologies,
real-world findings,
and bug bounty workflows.

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

<h2>

<a href="/blog/labs/htb/">

Labs

</a>

</h2>

<div class="post-excerpt">

Hands-on Hack The Box,
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

</div>
