---
layout: default
title: Home
---

## About This Space

This site is a curated knowledge base focused on practical offensive security, real-world bug bounty workflows, and structured certification-oriented notes.  
Content here prioritizes clarity, repeatability, and methodology over noise or trend-driven material.

Everything published is written from hands-on experience and intended to be usable as reference material during active learning or real engagements.

## Start Here

<div class="post-grid">

<article class="post-card">
  <h3><a href="{{ site.baseurl }}/posts/blog/">Technical Blog</a></h3>
  <p>Long-form explanations, deep dives, and structured notes on security concepts, tooling, and workflows.</p>
</article>

<article class="post-card">
  <h3><a href="{{ site.baseurl }}/posts/bugbounty/">Bug Bounty Notes</a></h3>
  <p>Realistic bug hunting notes, checklists, and patterns focused on modern web applications.</p>
</article>

<article class="post-card">
  <h3><a href="{{ site.baseurl }}/posts/hackthebox/">Hack The Box</a></h3>
  <p>Machine walkthroughs and methodology-driven approaches for labs and CTF-style environments.</p>
</article>

<article class="post-card">
  <h3><a href="{{ site.baseurl }}/posts/tryhackme/">TryHackMe</a></h3>
  <p>Room walkthroughs and guided learning paths for beginners and intermediates.</p>
</article>

<article class="post-card">
  <h3><a href="{{ site.baseurl }}/posts/offsec/">OffSec</a></h3>
  <p>PG Practice machines and certification preparation notes.</p>
</article>

<article class="post-card">
  <h3><a href="{{ site.baseurl }}/posts/vulnhub/">VulnHub</a></h3>
  <p>Vulnerable VM walkthroughs for practice and skill development.</p>
</article>

</div>

---

## Recent Notes

<div class="post-grid">
{% for post in site.posts limit:6 %}
  <article class="post-card">
    <div class="post-meta" style="font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem;">
      <span style="color: transparent; text-shadow: 0 0 0 #94a3b8;">📅 {{ post.date | date: "%b %d, %Y" }} • 📁 {{ post.categories | first | capitalize }}</span>
    </div>
    <h3>
      <a href="{{ post.url | relative_url }}">
        {{ post.title }}
      </a>
    </h3>
    {% if post.description %}
      <p>{{ post.description }}</p>
    {% elsif post.excerpt %}
      <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
    {% endif %}
  </article>
{% endfor %}
</div>

---

<div style="background: rgba(99, 102, 241, 0.1); border: 1px solid var(--primary); border-radius: 12px; padding: 1.5rem; margin: 2rem 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
  <div>
    <h3 style="margin: 0; color: white;">🚀 Premium Cybersecurity Resources</h3>
    <p style="margin: 0.5rem 0 0; color: var(--gray);">Battle-tested notes with 90% OFF • Used by 2,500+ professionals</p>
  </div>
  <a href="https://zishanhack.com/#resources" class="btn btn-premium">
    View Resources <i class="fas fa-arrow-right"></i>
  </a>
</div>

## Navigation

You can browse all content through the category sections above or access specific notes directly if you already know what you're looking for.  
This site is intentionally minimal and optimized for long-term reference rather than feed-style consumption.

<div style="text-align: center; margin-top: 2rem;">
  <a href="{{ site.baseurl }}/feed.xml" class="btn btn-outline btn-small">
    <i class="fas fa-rss"></i> Subscribe to RSS
  </a>
</div>

<style>
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.post-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
  box-shadow: var(--shadow);
}

.post-card h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.post-card h3 a {
  color: white;
  text-decoration: none;
}

.post-card h3 a:hover {
  color: var(--primary);
}

.post-card p {
  color: var(--gray);
  margin: 0;
  line-height: 1.5;
}
</style>
