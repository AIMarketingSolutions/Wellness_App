---
name: GitHub sync credentials
description: Distinguishes Replit's GitHub connector authorization from the credential used by local Git HTTPS pushes.
---

Replit's GitHub connector can be authorized for repository API access, including push permission, while the local Git remote still requires a separately valid HTTPS credential to push commits.

**Why:** The connector proxy keeps OAuth credentials server-side and does not expose them to the local `git` command. A successful connector repository check therefore does not prove that an embedded or environment-based Git credential can push.

**How to apply:** When GitHub sync fails, remove stale credentials from persistent remote URLs, verify remote read access and a non-writing authenticated push separately, and use a secure secret flow for the Git credential without logging or committing it.