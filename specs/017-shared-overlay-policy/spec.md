# Adopt published shared overlay policy

Status: Implemented locally; authenticated hosted acceptance pending
Date: 2026-10-31

Use installed design-system 21.0.10 global overlay policy and remove duplicated
portal styles. Publication/installation have already been completed by the user.

- FR-001 / AC-001: Standalone theme() and host theme() supply detached portal
  text/font/scheme and backdrop policy. Remove duplicate local adapters/backdrop
  rules and hardcoded dark schemes; light/dark Material controls inherit root roles.
- FR-002 / AC-002: Every owned Material select opts in through public panelClass
  ngx-select-panel. Preserve values, validation, multiselect and all dismissal/focus
  behavior. Remove local closing fixes and unnecessary global style encapsulation.
- FR-003 / AC-003: Existing real-animation regressions, application/spec types,
  interaction suites and normal production builds pass. Preserve routes, stores,
  DTOs and package pins; require the shared runtime release providing this policy.

Hosted federation/persistence acceptance remains distinct from local checks.
No deployment, publication or live data changes are included.
