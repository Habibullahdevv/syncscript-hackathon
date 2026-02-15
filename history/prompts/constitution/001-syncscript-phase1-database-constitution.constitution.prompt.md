---
id: 001
title: SyncScript Phase 1 Database Constitution
stage: constitution
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: JHOOLAY LAAL
command: /sp.constitution
labels: ["constitution", "database", "prisma", "neondb", "phase-1", "hackathon"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

```text
Project: SyncScript Phase 1 - Database Foundation

Core principles:

Serverless PostgreSQL only (NeonDB) for national scale

Prisma ORM exclusively for 25% data modeling score

ACID transactions for vault-user relationships

Zero-downtime schema evolution (prisma db push)

Key standards:

Exactly 5 Prisma models: User, Vault, VaultUser, Source, AuditLog

Role field format: "owner" | "contributor" | "viewer" strings only

Global unique IDs: @default(cuid())

Cloudinary-ready: Source.fileUrl field for Phase 2

Constraints:

Database: NeonDB PostgreSQL serverless ONLY

NO SQLite, NO local files, NO NoSQL

Relationships: User ↔ VaultUser ↔ Vault ↔ Source (many-to-many)

AuditLog required for every mutation (security score)

Success criteria:

npx prisma studio → 5 tables visible with relationships

npx prisma db push → 0 errors, 100% success

NeonDB dashboard → live tables confirmed

Prisma client generated → ready for Phase 2 APIs
```

## Response snapshot

Created comprehensive SyncScript Phase 1 Database Foundation Constitution (v1.0.0) with 8 core principles:

1. **Serverless PostgreSQL Only (NeonDB)** - Mandatory NeonDB with SSL, connection pooling
2. **Prisma ORM Exclusively** - Type-safe queries, schema as source of truth
3. **ACID Transactions for Vault Operations** - Atomic vault-user relationship changes
4. **Zero-Downtime Schema Evolution** - Backward-compatible migrations with NeonDB branching
5. **Five-Model Architecture (IMMUTABLE)** - User, Vault, VaultUser, Source, AuditLog only
6. **Role-Based Access Control Format** - String enum "owner"|"contributor"|"viewer"
7. **Global Unique Identifiers** - cuid() for all primary keys
8. **Cloudinary Integration Ready** - Source.fileUrl prepared for Phase 2

Included detailed relationship patterns with Prisma schema examples, indexing strategy, quality gates (8 blocking criteria), forbidden patterns, and governance rules.

Constitution file written to `.specify/memory/constitution.md` with Sync Impact Report prepended as HTML comment.

## Outcome

- ✅ Impact: Project constitution established for SyncScript hackathon Phase 1, defining database architecture standards and quality gates
- 🧪 Tests: N/A (constitution is governance document)
- 📁 Files: 1 file created (.specify/memory/constitution.md)
- 🔁 Next prompts: /sp.specify (create feature spec), /prisma-neon-setup (implement database), /sp.plan (architecture planning)
- 🧠 Reflection: Constitution provides clear constraints for 48-hour hackathon scope with 5-model limit, ensures NeonDB+Prisma alignment for 25% data modeling score, and establishes quality gates before Phase 2 backend development

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution creation successful on first attempt
- Graders run and results (PASS/FAIL): N/A (no automated graders for constitution)
- Prompt variant (if applicable): N/A (initial constitution)
- Next experiment (smallest change to try): Validate constitution against actual Prisma schema implementation in Phase 1 execution
