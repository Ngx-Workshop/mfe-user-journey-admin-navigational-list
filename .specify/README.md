# Specification workflow

Repository-local Markdown workflow adapted from the document-editor remote on 2026-10-07, inspired by GitHub Spec Kit. No CLI dependency or sibling checkout is required.

Read AGENTS.md, the constitution, architecture and development docs. For substantive changes select a feature in specs/README.md; create spec.md, plan.md, tasks.md and handoff.md using the local templates. Specify observable requirements, inspect the source, plan boundaries and compatibility, implement and verify. Record actual evidence separately from unavailable integration checks. User authorization to implement covers these stages without repeated approvals. Update docs and feature status as work progresses. Do not copy unrelated document-editor feature history.

Optional `.github/agents/speckit.*.agent.md`, prompt wrappers and `.specify/scripts/bash/` helpers are available. Their local repository context takes precedence over generic command recipes. Do not overwrite maintained feature plans or AGENTS.md using generic setup helpers.
