---
name: planning
description: Use in this repo whenever a non-trivial implementation plan is approved (to file it under docs/plannings/) or whenever a plan tracked in docs/plannings/ has just been finished (to summarize what was actually implemented into docs/plannings/concluidos.md and remove the plan file). Trigger phrases include "cria o plano", "registra esse plano", "termina o plano", "conclui o plano", "arquiva o plano".
---

# Planning workflow

This repo tracks implementation plans in `docs/plannings/`. See `docs/plannings/README.md` for the rationale. This skill has two entry points — starting a plan and closing one out. Figure out which one applies from context and do only that one.

## Starting a plan (plan just approved, work about to begin)

1. Write the approved plan to `docs/plannings/AAAA-MM-DD-titulo-curto.md` (today's date, kebab-case slug, in Portuguese to match the rest of `docs/`).
2. Content: the plan as agreed with the user — goal, approach, steps, files to touch. This is the *plan*, not the outcome — it's fine if it changes during implementation.
3. If the plan changes materially while work is in progress, update this same file rather than creating a new one.
4. Do not touch `docs/plannings/concluidos.md` at this stage.

## Closing out a plan (implementation finished and verified)

1. Re-read the plan file to compare against what actually happened — implementations often deviate from the original plan.
2. Prepend a new entry to `docs/plannings/concluidos.md` (most recent entry at the top, right after the intro paragraph), following the template already present in that file:
   - `## AAAA-MM-DD — Título curto`
   - What was actually implemented (prose or bullets) — the real outcome, not a restatement of the plan.
   - `**Desvios em relação ao plano:**` — only include this line if something actually changed from the original plan; omit it if execution matched the plan.
   - `**Arquivos principais alterados:**` — the key files touched, not an exhaustive diff.
3. Delete the corresponding plan file from `docs/plannings/`. `concluidos.md` is the only record that should remain.
4. Never resurrect a deleted plan file — if related work continues later, that's a new plan.

## Notes

- Only file plans for work that's actually plan-worthy (multi-step features, architectural changes) — trivial one-off fixes don't need an entry here.
- Keep entries in `concluidos.md` factual and skimmable; this file is meant to double as project history for onboarding and for the TCC writeup, not a changelog of every commit.
