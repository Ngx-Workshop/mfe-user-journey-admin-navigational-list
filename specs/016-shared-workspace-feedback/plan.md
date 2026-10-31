# Plan

Keep the domain-specific action adapter to map notifications, labels and output
intent. Replace its duplicated templates/styles and observer with shared components.
Use display:contents on the adapter so the shared sticky bar is bounded by the
workspace rather than a bar-height wrapper. Workspace owners bind heightChange to
local CSS sizing variables. Preserve existing offset overrides and responsive defaults.

Constitution check: standalone OnPush/signal APIs, inline templates/styles, BEM,
public library APIs, unchanged stores/adapters/contracts/exposures. Tests stay mirrored
under testing/app. No deviations. The published package is already installed by the
user; shell must provide a compatible singleton before hosted acceptance.

Verify real component composition, notification/live-region retention, actions,
counts and measured sizing in the existing interaction suite. Run layout/typechecks,
normal production build and appropriate federation regression. Record inherited
failures independently; no live catalog changes or deployment for validation.

Runtime requirement: raise only the design-system federation minimum to ^21.0.9,
which first provides these APIs. The user-installed package/lock edits are preserved.
The local shell still pins 21.0.8 and must be upgraded before hosted rollout; this
task does not change or deploy the shell.
