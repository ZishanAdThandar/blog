---
layout: default
title: Offensive Security Research
description: Offensive security research, Active Directory methodologies, bug bounty workflows, practical lab writeups, and hands-on cybersecurity notes.
---

<section class="hero-section">


<h1 class="hero-title">

Offensive Security Research Notes

</h1>

<p class="hero-description">

Hands-on offensive security research focused on Active Directory,
web exploitation, privilege escalation, attack methodologies,
bug bounty workflows, and practical lab-based learning.

</p>

<div class="hero-actions">

<a
href="/blog/research/"
class="btn btn-premium"
>

<i class="fas fa-book"></i>

Research Notes

</a>

<a
href="/blog/labs/"
class="btn"
>

<i class="fas fa-terminal"></i>

Labs & Walkthroughs

</a>

</div>

</section>




## Research Areas

<div class="posts-list">

<article class="post-card">

<div class="post-categories" style="margin-bottom: 1rem;">

<span class="category">

Research

</span>

</div>

<h2 class="post-title">

<a href="/blog/research/">

Offensive Security Research

</a>

</h2>

<p class="post-excerpt">

Active Directory tradecraft,
Windows internals,
privilege escalation,
enumeration workflows,
and practical offensive methodologies.

</p>

<a
href="/blog/research/"
class="btn read-more"
style="margin-top: 1rem;"
>

Explore Research

<i class="fas fa-arrow-right"></i>

</a>

</article>

<article class="post-card">

<div class="post-categories" style="margin-bottom: 1rem;">

<span class="category">

Bug Bounty

</span>

</div>

<h2 class="post-title">

<a href="/blog/bug-bounty/">

Bug Bounty & Web Exploitation

</a>

</h2>

<p class="post-excerpt">

Reconnaissance workflows,
web exploitation,
authentication flaws,
attack chains,
and practical real-world methodologies.

</p>

<a
href="/blog/bug-bounty/"
class="btn read-more"
style="margin-top: 1rem;"
>

Explore Bug Bounty

<i class="fas fa-arrow-right"></i>

</a>

</article>

<article class="post-card">

<div class="post-categories" style="margin-bottom: 1rem;">

<span class="category">

Labs

</span>

</div>

<h2 class="post-title">

<a href="/blog/labs/">

Labs & Walkthroughs

</a>

</h2>

<p class="post-excerpt">

Hack The Box,
TryHackMe,
OffSec,
HackeR DNA,
and VulnHub walkthroughs
focused on methodology,
enumeration,
and exploitation workflows.

</p>

<a
href="/blog/labs/"
class="btn read-more"
style="margin-top: 1rem;"
>

Explore Labs

<i class="fas fa-arrow-right"></i>

</a>

</article>

</div>





## Latest Technical Notes

<div class="posts-list">

{% for post in site.posts %}

<article class="post-card">

<div class="post-categories" style="margin-bottom: 1rem;">

{% if post.categories.size > 0 %}

{% for category in post.categories %}

<span class="category">

{{ category }}

</span>

{% endfor %}

{% else %}

<span class="category">

Research

</span>

{% endif %}

</div>

<h2 class="post-title">

<a href="{{ post.url | relative_url }}">

{{ post.title }}

</a>

</h2>

<p class="post-excerpt">

{% if post.description %}

{{ post.description }}

{% else %}

{{ post.excerpt
| strip_html
| truncate: 240 }}

{% endif %}

</p>

<div class="post-meta">

<div class="post-date">

<i class="fas fa-calendar"></i>

{{ post.date | date: "%B %d, %Y" }}

</div>

<div class="post-readtime">

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

</div>

</div>

{% if post.tags %}

<div class="post-tags" style="margin-top: 1rem;">

{% for tag in post.tags limit:4 %}

<span class="tag">

#{{ tag }}

</span>

{% endfor %}

</div>

{% endif %}

<a
href="{{ post.url | relative_url }}"
class="btn read-more"
style="margin-top: 1rem;"
>

Read Article

<i class="fas fa-arrow-right"></i>

</a>

</article>

{% endfor %}

</div>
