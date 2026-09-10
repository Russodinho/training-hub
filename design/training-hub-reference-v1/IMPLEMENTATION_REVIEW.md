# Design fidelity review — changes required

Reviewed 2026-09-10 after Claude's shared-theme implementation. **Result: the implementation does not yet match the supplied page boards.** This conclusion comes from the current JSX/CSS and the design generator/boards, not from an assumption that a successful build implies visual accuracy.

Scope: all 14 current routes, shared navigation/styles and relevant dashboard/chart components. No application code was modified during this review. The browser runtime failed to initialize, so live screenshots and computed-style checks remain unverified. The items below are source-confirmed unless explicitly marked as a visual check.

## Findings, in priority order

### 1. [P1] Dashboard's mobile breakpoint cannot override its inline grid

**Evidence:** `src/app/page.tsx:130` sets inline `gridTemplateColumns: '1fr 320px'`. `src/app/globals.css:1067` declares the same layout and attempts to collapse it at 900px. The normal stylesheet declaration loses to the inline declaration.

**Effect:** the dashboard keeps a 320px right column alongside the left column at phone widths. At a 390px viewport its existing 56px horizontal page padding leaves 334px for a grid that already needs 320px plus a 16px gap, before allocating any left-column content. This cannot produce the board's single mobile column.

**Correction:** remove the inline column declaration; define the grid and mobile order through a page class. Use `minmax(0,1fr)` tracks. Implement the actual board structure: race tile + separate workout tile on the first desktop row; timeline + recovery beneath. On mobile: race, workout, timeline, compact purple recovery card. Do not retain the old 320px rail just because its color now matches.

**Acceptance:** at 390px the whole first section is one column with 20px side insets and no document horizontal overflow. At desktop the top two cards occupy equal columns, matching `boards/01-dashboard.png`.

### 2. [P1] Wind-Down has no styles for its page-specific classes

**Evidence:** `src/app/wind-down/page.tsx:121`, `:126`, `:142`, `:148`, and `:170` use `wind-intent`, `wind-status`, `wind-grid`, `wind-card`, and `wind-rules`. A search across `src/**/*.css` and `src/**/*.tsx` finds no CSS definitions for these selectors. The page imports no separate stylesheet. Defining `--wind` color variables does not style these elements.

**Correction:** implement the summary card with a purple progress ring, one-column ordered stretch rows, inset moon glyphs, visible completion controls, spacing and ground-rule card from `boards/11-wind-down.png`. Keep full cues and breathing guidance in an expandable detail region rather than losing them. Use a dedicated details control separate from the completion control.

**Acceptance:** all five stretches have the designed card shell; the ring tracks the existing `done/total`; completion is visible; full instructions remain reachable with keyboard and touch.

### 3. [P1] Mobile layout still has fixed-width structures that cannot match the boards

**Evidence:**

- `src/app/recovery/page.tsx:180`: `minmax(180px,1fr)` with 12px gap requires 372px of content width for two tiles. At 390px the page has only 342px after padding, so this becomes one column instead of the board's 2 × 2 summary.
- Recovery's daily rows (`:79`) and header (`:210`) retain five columns with a fixed 110px date track; there is no mobile day-card layout.
- `src/app/race-day/page.tsx:202` hardcodes two equal columns inline; its six-result grid is also fixed (`globals.css:595`). Neither has the required phone layout.
- `globals.css:413`, `:545`, `:627` use minimum 300px race/injury tracks and 280px mobility tracks. At 320px, `.hub-page` leaves 272px after its 48px padding, so these minima exceed the available width.

**Correction:** define explicit mobile layouts rather than relying on these desktop minima. Recovery uses `repeat(2,minmax(0,1fr))` summary cards and readable daily cards; Race Day stacks its timeline, strategy and checklist and wraps result fields; phone lists use `minmax(0,1fr)` with wrapping content. Use 16px page insets at 320px, 20px at 390px.

**Acceptance:** review these routes at 320px and 390px with actual long labels; no clipped controls, squeezed five-column table, or document overflow.

### 4. [P2] None of the generated imagery is used

**Evidence:** source search for `training-hub-design`, `race-landscape`, `oats-blueberries`, and `body-silhouette` returns no matches in `src`. Race Calendar still maps old `race-card` blocks (`race-calendar/page.tsx:180`); Fuel still renders `meal.icon` (`fuel/page.tsx:596`); Injuries still maps the old card grid (`injuries/page.tsx:362`).

**Correction:** wire in the assets already present:

| Board | Required asset and placement |
| --- | --- |
| Dashboard | `/training-hub-design/race-landscape.png`, clipped inside next-race tile, dark overlay, real race text above it |
| Race Calendar | Same landscape, 70 × 78px thumbnail at the left of each race row |
| Fuel / Meals | `/training-hub-design/oats-blueberries.png`, 76 × 80px thumbnail for the matching breakfast recipe |
| Injuries | `/training-hub-design/body-silhouette.png`, 105 × 198px contain area beside the active injury summary |

Use generated artwork as decoration, not as a claim about an actual race venue or anatomical diagnosis. Do not invent a body-map location for free-text injury data.

### 5. [P2] Navigation does not match the delivered desktop or mobile shell

**Evidence:** `Sidebar.tsx:8` onward retains the old 15px/16-viewBox icons; the delivered system uses 24-viewBox icons displayed at 18px desktop and 20px mobile. `Sidebar.tsx:269`–`:278` renders only `{label}` in bottom links, with no icons. `globals.css:855` sets a 208px sidebar, whereas the generated boards use 184px. Group headings and abbreviated labels differ from the board's flat route list. The brand is 15px (`globals.css:898`), versus 19px in the board.

**Correction:** use the supplied SVG paths, exact board labels/order, 184px sidebar and its two-line brand. Add Home/Plan/Train/Recover/Fuel glyphs above the bottom labels. Keep the aqua active state, which is already correct.

**Related source-confirmed bug:** the Train group's `paths` contains `/settings` (`Sidebar.tsx:154`), and those values are rendered as actual links (`:260`). There is no `/settings` page or redirect in the current route tree/configuration; the implemented page is `/settings/exercises`. Use an explicit destination/label for Exercises while retaining prefix matching separately if needed. Do not display the raw `/settings` string.

**Additional layout difference:** `.app-content` always reserves 88px at mobile (`globals.css:1087`) even when Home/Fuel render no secondary navigation. The extra fixed subnav is not drawn in the boards. Use a compact group menu that is closed by default and does not consume a second permanent header row. Keep all sibling destinations reachable.

### 6. [P2] Selected tabs still use the old gray treatment

**Evidence:** `.mh-tab-bar` is capped at 380px with a 10px radius and 5px inset (`globals.css:764`); `.mh-tab-btn.active` remains `background: var(--s3); color: var(--text)` (`:766`). The board tabs are pill-shaped, aqua-filled for the selected segment, with dark text. This affects Fuel, Season Plan and Training Log. Workout Log uses a translucent selection (`log/page.tsx:358`), Exercises a white one (`settings/exercises/page.tsx:111`), and Recovery uses another outlined treatment (`recovery/page.tsx:153`).

**Correction:** use one segmented-control component with the board appearance: slate track, 18px radius, aqua gradient selected segment, dark selected label, full mobile width and desktop width up to 600px. Keep scrolling for categories that exceed the width. Preserve tab contents and selection logic.

### 7. [P2] Changing shared classes did not update inline card surfaces and typography

**Evidence:** shared `.card` now has the correct gradient (`globals.css:273`), but many visible cards do not use that class. The dashboard's `cardStyle` (`page.tsx:104`) still has a flat `var(--s2)` background, 0.5px border and 14px radius. `RecoveryCard.tsx:62` and `recovery/page.tsx:44` also retain flat backgrounds. Workout exercise cards (`log/page.tsx:160`), Sleep rows (`sleep/page.tsx:118`), and Exercises rows (`settings/exercises/page.tsx:156`) have their own styling.

Recovery's title is explicitly 22px IBM Plex Mono (`recovery/page.tsx:163`). Old small monospace persists in `.tag`, `.chip`, `.stat-lbl`, `.mob-meta`, `.inj-label`, chart labels, set controls and many inline labels. These do not inherit a new Figtree heading rule.

**Correction:** apply shared visual primitives to actual rendered elements, removing conflicting inline aesthetic properties. Use the board's 10px card radius, 1px `#304653` border, blue gradient; 27px desktop/25px mobile page headings, 16–18px card titles, 14px row titles, 12px metadata. Figtree is the intended production family; verify that it really loads. The PNG renderer may have used Segoe UI fallback, so exact font-rasterization identity is not established.

**Acceptance:** inspect representative computed styles, not just `:root`. The shared token values are largely correct already; this is an application-of-styles problem.

### 8. [P2] Mobility and recovery summary geometry remains from the old UI

**Evidence:** Mobility's progress remains a text fraction (`mobility/page.tsx:91`), and its summary uses emoji (`:79`); no green ring or inset glyph list exists. The completed summary still explicitly uses `var(--lift-t)` at `:78`, now purple, rather than green. `.mob-card.dimmed { opacity:0.35 }` remains (`globals.css:557`). `RecoveryCard` uses a 108px SVG with 7px stroke and a large vertical stack; the board requires a larger desktop ring and a compact purple horizontal mobile tile.

**Correction:** implement the board ring and compact row components. Use the actual required denominator on short-routine days. Green completion border/check, readable Optional label, no whole-card opacity reduction. For the dashboard, keep semantic Good/Fair/Low text and thresholds, but use the board's purple recovery motif rather than repurposing the ring's entire appearance as a new threshold system.

### 9. [P2] Major page structures remain unchanged

These are separate implementation tasks, not things a global palette replacement can fix:

| Route / target board | Current evidence | Required layout correction |
| --- | --- | --- |
| `/` / 01 | `page.tsx:130`, `:161`, `:239` | Separate workout from race card; equal desktop columns; timeline rows with sport tiles; mobile recovery strip; keep remaining real dashboard data below. |
| `/race-calendar` / 02 | `race-calendar/page.tsx:180`; `globals.css:413` | One list of wide scenic race rows, not a multi-column grid of text cards. Preserve add/remove/restore and safety details. |
| `/season-plan` / 03 | `season-plan/page.tsx:207`, `:234` | Compact four-phase strip first; weekly activity rows beneath; old long phase blocks become accessible detail. No mandatory seven-day grid: the delivered board uses rows. |
| `/log` / 04 | `log/page.tsx:133`, `:160`, `:338` | Purple exercise glyph/header, spacious set grid, board form alignment, explicit add-set action and aqua selected workout segment. Preserve all set fields. |
| `/training-log` / 05 | `TrainingLogClient.tsx:282`, `:306`, `:575`; `LiftProgressChart.tsx:120` | Board summary-card proportions, corrected tabs and typography, card-based history rows. Retain the true lift line chart and separate tab content. |
| `/cardio` / 06 | `cardio/page.tsx:91`, `:198`, `:250` | Replace tiny dot/dense table-row visual with sport tile + padded activity card, match summary cards and range selector. A volume chart would be new work, not a currently existing graph: do not fabricate it from sample bars. |
| `/fuel` / 07 | `fuel/page.tsx:728`, `:743`, `:596` | Aqua tabs; compact import card; large nutrition summary; recipe thumbnail treatment. Keep Meals/Supplements in their actual tabs. Actual-progress rings need real corresponding actuals/targets; otherwise use an honest empty/target-only state. |
| `/mobility` / 08 | `mobility/page.tsx:78`, `:109`; `globals.css:545` | Green ring summary and one-column compact movement rows; expanded instructions retain content. |
| `/sleep` / 09 | `sleep/page.tsx:86`, `:97`, `:109` | Replace disconnected streak/bar with purple summary card; moon tiles, rounded checklist rows, aqua quality segment and full-width notes/save. |
| `/recovery` / 10 | `recovery/page.tsx:160`, `:180`, `:206` | Figtree title, 2 × 2 summary at both board sizes, daily card list with values; optional expanded detail preserves the data table. |
| `/wind-down` / 11 | `wind-down/page.tsx:121` onward | Supply missing styles; purple ring and ordered moon-icon rows; full guidance in details. |
| `/injuries` / 12 | `injuries/page.tsx:261`, `:362` | Silhouette + active summary, updates below, separate past-injury rows. Preserve all injury forms and history. |
| `/race-day` / 13 | `race-day/page.tsx:144`, `:202` | Race summary card followed by timeline and checklist card rows; stack at both supplied board sizes. Keep strategy/results details accessible. |
| `/settings/exercises` / 14 | `settings/exercises/page.tsx:111`, `:129`, `:156` | Aqua categories, purple exercise icon rows, readable 2-column edit form, consistent Save/Cancel. Preserve six categories and inactive states. |

### 10. [P2] The earlier handoff allowed conflicting visual targets

This part is a design-handoff problem, not solely an implementation mistake. `CLAUDE_IMPLEMENTATION.md` allowed narrower desktop forms (700px/760px), optional multi-column Mobility/Wind-Down layouts, four desktop recovery tiles and two-column Race Day, while the SVG boards show full-width forms, single lists, 2 × 2 recovery tiles and stacked Race Day. It also called the original image composites the highest visual authority. That does not define one exact target.

**For the user's current request to match the files Codex made, use this order:**

1. This review's resolved choices below.
2. Each numbered `boards/*.svg` for geometry and `boards/*.png` for visual comparison.
3. `components.svg` / `reference-theme.css` for reusable primitives.
4. The earlier implementation document for preserving real content, tabs and behavior, only where it does not contradict the resolved visual choices.
5. Original composites as background inspiration; do not substitute their fictional features or a different layout for the numbered boards.

## Resolved measurement contract

- Compare the application portion of a board, excluding its gray presentation background, page-number caption and outer device/frame decoration.
- The desktop application frame is 1100px wide. Sidebar: 184px; content inset: 24px each side; usable main width: 868px. Reproduce this at a 1100px browser viewport. At larger widths, keep sidebar width and inset stable and cap main content at 1100px. **Do not keep the earlier 600/560/700/760px per-page form caps** when targeting these boards.
- Mobile application frame: 390px wide; 20px insets; 350px content. At 320px use 16px insets and let long content grow vertically. Board artboards are tall to show scroll content; do not reproduce the artificial blank space before their bottom nav as fixed content height.
- Use 16px primary layout gaps, 66px minimum compact row body, 10px card radius, 36px icon tile with a 24px glyph. Long text and real detail can increase height. Controls have at least 44px hit areas even where a board draws a 40px button.
- Standard page heading: 27px desktop, 25px mobile; white, 600–700 weight. Secondary line: 14px desktop/13px mobile. Avoid the old header divider absent from the boards.
- Sidebar: flat list with the exact labels/order from `route-manifest.json`, not additional group headings. Settings/Exercises stays reachable. Bottom navigation retains five groups with icons; secondary group navigation opens without adding permanent chrome to the resting view.
- Single-column main lists for Calendar, Season weekly rows, Mobility, Wind-Down, Injuries updates and Race Day. Recovery summary is 2 × 2 on both desktop and mobile. Existing extra content belongs below these visible summaries or in accessible details.
- Dashboard is the exception: two equal columns of race/workout, then timeline/recovery at desktop, stacked in that order on mobile. Preserve all existing additional charts, schedule data and summaries below the illustrated region.
- Fuel and Training Log boards include examples from several tabs. They are **not** instructions to mix all of that content under the selected tab. Match the shown component appearance in its correct actual tab.
- Never copy illustrative race names, medical values, completed counts or bar heights into the real application. Exact appearance of a populated mockup is not possible in a live empty/off-season state. Match the component shell and show the honest state. Build populated visual fixtures separately if needed for comparison.
- Font check: source target is Figtree. Inspect rendered font before claiming a pixel match to PNGs; this review has not established the font used by the original PNG rasterizer.

## Required finish checks for Claude

Implement shared primitives and fix mobile defects first, then complete **each** route row above. Do not declare the redesign complete after updating tokens alone.

For every route, record a desktop 1100px and mobile 390px comparison against its board, plus 320px/768px/1440px overflow checks. Review all existing tabs, add/edit forms, long content, disabled/saved/error states and keyboard focus. Use matching seeded visual data without writing fake records into the user's database. Check for missing images and wrong computed font/background/tab styles. Run the repository build after application changes. A 200 response or successful build does not establish design fidelity.

Current review verification: all 14 source routes and design mappings inspected; generated asset references absent from source; missing Wind-Down selectors confirmed; inline dashboard breakpoint conflict confirmed. Browser review was attempted but blocked by a local browser-tool initialization error. No visual pass or pixel match is claimed.
