# Training Hub — design handoff for Claude

**Latest review:** [Implementation review and resolved design targets](IMPLEMENTATION_REVIEW.md). Read this first when correcting Claude's implementation. It resolves conflicts between the earlier prose and numbered page boards for the user's request to match those boards.

**Latest review:** [Implementation review and resolved design targets](IMPLEMENTATION_REVIEW.md). Read this first when correcting Claude's implementation. It resolves conflicts between the earlier prose and numbered page boards for the user's request to match those boards.

Prepared 2026-09-10. User request: design every page in the visual style of the two supplied Training Hub images, generate the visual assets, and hand the work to Claude to implement the redesign.

**Start with the original references:** [Desktop](references/desktop-reference.png) and [Mobile](references/mobile-reference.png). These are the authoritative visual targets. The new boards translate that direction onto the 14 actual routes; they are not pixel-identical reproductions of the reference composites. The references contain fictional races, sample metrics, and features this application does not have. Preserve real content and functionality while matching their appearance.

**User authorization:** the user explicitly asked Claude to redesign the site using this handoff. For this task, that authorizes Claude to implement these visual decisions despite the older role split in `CLAUDE.md`. Codex has prepared the design assets; Claude should implement and validate them.

## Deliverables

- [All-page overview](all-pages.png): 14 paired desktop/mobile boards.
- [Route manifest](route-manifest.json): route-to-board and navigation mapping.
- [Implementation specification](CLAUDE_IMPLEMENTATION.md): page anatomy, secondary tabs, states, and acceptance checks.
- [Reference theme CSS](reference-theme.css) and [colors](tokens.json).
- [Component sheet](components.png): palette, all icons, controls and state styling.
- `boards/`: editable SVG and rendered PNG for each route. SVGs embed artwork and work without external image dependencies.
- `../../public/training-hub-design/`: 26 individual SVG icons, mountain/lake art, recipe photo, and transparent injury silhouette.
- [Asset manifest and generation prompts](ASSETS.md).

The board frames, captions, illustrative values, and design annotations are not application content. These are static layout deliverables, not working replacement pages. They show the main view of each route; the implementation specification defines the remaining tabs, expanded views, and longer content. The SVG type stack uses Figtree with Segoe UI fallback; this machine's PNG rendering may use the fallback. In the app use its existing Figtree font consistently.

## Boards

| Route | Desktop and mobile layout |
| --- | --- |
| `/` | [01 Dashboard](boards/01-dashboard.png) |
| `/race-calendar` | [02 Race Calendar](boards/02-race-calendar.png) |
| `/season-plan` | [03 Season Plan](boards/03-season-plan.png) |
| `/log` | [04 Workout Log](boards/04-log.png) |
| `/training-log` | [05 Training Log](boards/05-training-log.png) |
| `/cardio` | [06 Cardio](boards/06-cardio.png) |
| `/fuel` | [07 Fuel](boards/07-fuel.png) |
| `/mobility` | [08 Mobility](boards/08-mobility.png) |
| `/sleep` | [09 Sleep Protocol](boards/09-sleep.png) |
| `/recovery` | [10 Recovery](boards/10-recovery.png) |
| `/wind-down` | [11 Wind-Down](boards/11-wind-down.png) |
| `/injuries` | [12 Injuries](boards/12-injuries.png) |
| `/race-day` | [13 Race Day](boards/13-race-day.png) |
| `/settings/exercises` | [14 Exercises](boards/14-exercises.png) |

No separate screens should be created for removed/redirected `/nutrition`, `/meal-hub`, `/supplements`, `/workouts`, `/progress`, `/tri-plan`, `/stretch-goals`, or `/schedule`. Their surviving capabilities belong to Fuel, Training Log, Season Plan, or Dashboard.

## Rebuilding this package

Run from the repository root:

```powershell
python design/training-hub-reference-v1/build_boards.py
node design/training-hub-reference-v1/render_boards.cjs
```

The builder copies the supplied reference images from the original Downloads location. Keep the delivered copies if that location is later removed. Sharp is already installed in this workspace. No new project dependency, source page, business logic, integration, or deployment setting was changed to produce this package.
