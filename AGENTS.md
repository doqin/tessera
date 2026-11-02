# AGENTS.md

Canonical instructions for AI coding agents in this repository live in
[`CLAUDE.md`](./CLAUDE.md). Read that file in full before starting any task. It is written for
Claude Code, but its rules apply to every agent (Codex, Cursor, Copilot, Gemini, etc.).

Before changing code, also read:

1. `.specify/constitution.md` — non-negotiable project principles.
2. `specs/<NNN-module>/spec.md`, `plan.md`, and `tasks.md` for the module in scope. Follow the SDD
   order: spec → plan → tasks → code. Stop and ask if the spec is missing or ambiguous.

If this file and `CLAUDE.md` ever differ, `CLAUDE.md` and the constitution win. Update
`CLAUDE.md` rather than maintaining a parallel rule set here.

## Quick reference

- **Stack:** Next.js `13.5.11` (App Router), React `18.2`, TypeScript strict, Module Federation via
  `@module-federation/nextjs-mf` `8.8.76` (pinned — do not upgrade casually). See
  `docs/findings/R2-module-federation-nextjs-approuter.md` §13 before touching versions or
  `next.config.js`.
- **Config files:** `next.config.js` and `postcss.config.js` must be CommonJS `.js`; Next.js 13.5
  does not accept `.ts`/`.mjs` for them.
- **Install:** use an NTFS drive. `npm install` fails on exFAT because npm workspaces need
  symlinks/junctions.
- **Before considering work done:**

  ```bash
  npm run lint
  npm run typecheck
  npm test
  npm run format
  ```

- **Architecture:** Shell (host) / Micro Frontend modules (remotes) / Integration Layer. Modules
  must not import each other's internals; communicate through
  `@tessera/integration-store` or custom events.
