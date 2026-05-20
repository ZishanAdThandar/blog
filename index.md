---
{% endfor %}

</div>

---

# Research Categories

<div class="category-grid">

{% for item in page.research_categories %}

<div class="category-card">

# {{ item.icon }} {{ item.title }}

{{ item.description }}

[Explore Category →]({{ item.link }})

</div>

{% endfor %}

</div>

---

# About

ZishanHack is a cybersecurity research platform focused on:

- Penetration Testing
- Web Application Security
- Active Directory Exploitation
- Offensive Security Research
- Red Teaming
- Bug Bounty Hunting
- Security Automation

---

# Recent Posts

{% for post in paginator.posts limit:8 %}

<div class="modern-post-card">

## [{{ post.title }}]({{ post.url }})

{{ post.description | truncate: 160 }}

<div class="modern-post-meta">

{{ post.date | date: "%B %d, %Y" }} • {{ post.read_time | default: "7 min read" }}

</div>

</div>

{% endfor %}

---

# Connect

- GitHub: https://github.com/ZishanAdThandar
- LinkedIn: https://linkedin.com/in/zishanahamedthandar
- Blog: https://zishanhack.com
