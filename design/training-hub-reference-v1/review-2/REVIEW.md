# Live app design review — second correction pass

Reviewed 2026-09-10 against `http://localhost:3000`, after Claude's “Implementing IMPLEMENTATION_REVIEW.md corrections” handoff entry.

**The app is improved, but several major visual and usability misses remain. This time the findings include actual browser screenshots and measurements.** Captured all 14 routes at 1100 × 900, 390 × 844 and 320 × 800, plus Fuel's Meals/Supplements, Training Log's History/Tri Sessions/Body Comp, and expanded Wind-Down. The captures use a separate headless Chrome profile, real read-only app data, and 1× scale. No records were added, changed or deleted. No application source was changed during this review.

The regular browser and computer-use runtimes failed to initialize. A separate headless Chrome session successfully provided screenshots, DOM geometry and actual font information. The Next.js development indicator is visible in these screenshots; its overlap with Home is a development-only artifact, not evidence of a production navigation defect. Windows scrollbars consume 15px on scrolling pages; measurements below use `documentElement.clientWidth`, not just the requested outer width.

## Confirmed improvements — retain these

- Dashboard now has separate race/workout columns and genuinely stacks on mobile. The scenic race background loads.
- Wind-Down now has styled summary/list cards, a progress ring and expandable instructions. Its desktop composition is much closer to board 11.
- Sidebar is 184px and the route labels/order match the manifest. Mobile bottom icons exist, and Exercises points to the actual route.
- Recovery's summary stays 2 × 2 on mobile, with labeled daily data below.
- Race Day's result fields and main sections reflow on mobile. The outer race/injury/mobility grids no longer force their old desktop minimum widths at 390px.

These findings supersede the corresponding “missing” items in the previous review. Do not redo them from scratch.

## New or newly verified findings

### 1. [P1] Figtree is not actually loading

The browser reports **Arial** as the platform font used by page titles and tested row names, even though their computed CSS says `Figtree, sans-serif`. No Figtree or IBM Plex font face is registered; the only font-face rules observed belong to the Next.js development overlay.

The cause is visible in the compiled app stylesheet: the Google Fonts `@import` is at line 603, after ordinary CSS rules. It originates at `src/app/globals.css:5`, below the Tailwind directives, which expand into earlier rules. An import in that position is ignored. Merely seeing “Figtree” in `getComputedStyle().fontFamily` did not verify that font was rendered.

**Correction:** load the intended font reliably through the app's font setup or place its import before rules that expand to normal CSS. Use Figtree consistently for UI and chart labels; eliminate remaining tiny monospace labels where the boards use sans-serif. Verify with actual platform-font information after loading. Do this before measuring final typography/spacing because the correct glyph widths can change wrapping.

Evidence: `detail-observations.json` → `platformFonts` and `fontRules`; compiled `.next/static/css/app/layout.css:603`. The compiled file is evidence only: fix source, not `.next`.

### 2. [P1] Mobile Meals cards completely hide the recipe name

[Screenshot: Fuel → Meals](screenshots/fuel-meals-390.png).

At 390px, the first recipe's `.mh-info`, `.mh-name` and `.mh-subtitle` measure **0px wide**. The non-shrinking macro pills occupy 224.5px beside the icon, gaps and chevron, leaving no width for the name. This is more serious than ordinary truncation: the user sees a star and nutrition badges with no dish name.

Source: `src/app/globals.css:850`–`:853`, `src/app/fuel/page.tsx:594` onward. `.mh-info { flex:1; min-width:0 }` combined with `.mh-pills { flex-shrink:0 }` allows the title to collapse entirely.

**Correction:** on mobile put image/icon + wrapping recipe title + disclosure control on the first row, macro pills on a separate wrapping row. Keep name/subtitle visible; do not solve this by making them smaller. Use the existing oats photo for the matching breakfast recipe. Preserve full ingredients/method below.

Acceptance: the dish name is readable at 320px and 390px with four macro values present. See `meal-probe.json` for measured proof.

### 3. [P1] Cardio shows “INVALID DATE – INVALID DATE”

[Screenshot: Cardio](screenshots/06-cardio-390.png).

This appears above populated activity groups. Source confirms the cause: `weekLabel()` appends `T00:00:00` at `src/app/cardio/page.tsx:67`, while its caller at `:252` already passes `wk + 'T00:00:00'`. The resulting date string has the time suffix twice.

**Correction for Claude:** pass the date-only key into the function once and confirm the displayed Monday–Sunday range, including a week that crosses a month/year boundary. Keep this separate from the visual refactor so it is not overlooked as “just styling.” No business logic was changed by this review.

### 4. [P2] Date controls squeeze page headings into narrow columns

[Workout Log desktop](screenshots/04-log-1100.png), [Workout Log phone](screenshots/log-header-390.png), [Sleep phone](screenshots/sleep-header-390.png).

Workout Log wraps its title even at desktop width. On the 390px capture, its heading region gets only **104.5px**, while the date field gets **230.5px**. Sleep's corresponding widths are **126.6px** and **208.4px**. The global input rule sets `width:100%` (`globals.css:346`–`:354`); these date inputs live directly in the header flex row and compete with the title.

**Correction:** give desktop header date controls an explicit compact width and `flex:none`. On mobile place the date control on a second full-width row or with the form fields as drawn in the boards. Keep title/description together. Remove the restrictive old 600px Workout / 560px Sleep page caps when following the current board contract.

The same pattern occurs in Lift Progress: `LiftProgressChart.tsx:23` sets the select's minimum width to 240px, crushing the change summary into a narrow vertical stack of words on phones. Stack the selector and summary on mobile, and show four summary metrics as 2 × 2 cards if needed instead of shrinking their labels further. [Screenshot](screenshots/05-training-log-390.png).

### 5. [P2] Nested grids still overflow at 320px

The outer-grid fix does not cover nested inline grids further down the pages:

- **Race Calendar:** client width 305px, document width 315px. The Open Water checklist at `race-calendar/page.tsx:267` still uses `minmax(280px,1fr)` inside a padded card. Its items extend to x=315.
- **Fuel:** client width 305px, document width 316px. Base foods at `fuel/page.tsx:810` has the same 280px minimum, with a non-shrinking 120px time label at `:821`. Additional 280px grids at `:888` and `:969` need the same check.
- **Training Log:** the initial 320px Lifts capture has document width 309px versus a 305px visible client area; inspect the chart controls and their minimum widths after applying finding 4.

**Correction:** remove mobile minimums from nested grids too; use `minmax(0,1fr)` and stack fixed labels above their descriptions on narrow screens. Do not hide document overflow to conceal the content. Recheck the full page, not just the first visible cards. Details and coordinates are in `detail-observations.json`.

### 6. [P2] Wind-Down's new disclosure controls are not keyboard controls

The expanded content renders correctly when clicked. However, `.wind-row` (`wind-down/page.tsx:147`) and `.wind-rules-title` (`:177`) are clickable `div`s with no keyboard handling and `tabIndex:-1`. Keyboard users can reach the completion circles but cannot open the instructions or ground rules. The completion buttons measure **26 × 26px**, below the design contract's 44px hit area.

**Correction:** use a real disclosure button with `aria-expanded` and an associated details region, separate from the completion button. Make the check's hit area at least 44px while keeping the smaller circle graphic centered inside. Do the same for Ground Rules. Do not nest one button inside another.

The repeated subtitle “Passive · Follow existing cues” is also a board placeholder that escaped into the live product. Replace it with the actual short focus/duration already available in each stretch object, so a collapsed card is informative. Preserve the full instructions behind the disclosure.

Evidence: `detail-observations.json` → `wind-down-expanded.controls`; [expanded screenshot](screenshots/wind-down-expanded-390.png).

### 7. [P2] Fuel's empty state sends users back to the page they are already on

[Screenshot: Fuel Targets](screenshots/07-fuel-390.png).

The upload panel is directly above the empty nutrition panel, but the empty message says to upload on the “Nutrition page” and links to `/nutrition`, which redirects to `/fuel`. It is a circular instruction and consumes substantial vertical space with another button.

Source: `src/components/dashboard/NutritionActualsPanel.tsx`, empty-state branch. The component is shared with the dashboard, so its message/action should be aware of placement.

**Correction:** on Fuel say “Upload a Cronometer CSV above to see your actuals” or link to the upload region. On Dashboard link directly to `/fuel`. Keep honest missing-data placeholders; do not fill rings with mock values just to resemble the board.

### 8. [P2] Several mobile screens remain dominated by setup/detail instead of the intended summary

- **Race Day:** race metadata is squeezed beside a three-line title, and the pre-race result-entry form fills most of the first screen. The preparation timeline/checklist is pushed below it. Put title, race summary and preparation first; make results a collapsed “Record results” region until requested, preserving its existing fields. [Screenshot](screenshots/13-race-day-390.png).
- **Injuries:** the first injury's full symptoms/treatment/history form consumes nearly the entire viewport, so the other active injuries and Add Injury are hard to discover. Implement the intended silhouette + compact active summary, then expandable detail/update sections. Do not remove the clinical notes. [Screenshot](screenshots/12-injuries-390.png).
- **Mobility:** long expanded instruction cards still replace the designed compact movement list and completion ring. Port the improved Wind-Down visual pattern, with independent accessible completion and disclosure controls, to Mobility. [Screenshot](screenshots/08-mobility-390.png).
- **Season Plan:** oversized countdown/philosophy content appears before the phase navigation and weekly training. The compact four-phase strip and week rows are still absent. Keep the existing plan notes available below/in details. [Screenshot](screenshots/03-season-plan-390.png).

These are presentation changes around existing data, not requests to delete functionality or invent new training guidance.

## Remaining board fidelity work, confirmed visually

| Area | Remaining change |
| --- | --- |
| Dashboard | Race tile is about 263px high in the phone capture versus the board's 174px; the extra pill link, padded opaque countdown boxes and white numbers change its proportions. Use slim aqua digits and quieter captions; reduce extra vertical padding. Timeline rows need their individual neutral card shells rather than a large surrounding card with strongly tinted strips. Preserve real recovery details below the compact summary. |
| Shared tabs | Fuel, Season Plan and Training Log still use gray rectangular selected segments. Log uses an aqua outline, Exercises a white chip. Apply one aqua pill treatment as already specified. |
| Calendar | Still a grid of text-heavy cards, no scenic row thumbnails. Past cards use 50% whole-card opacity and are difficult to read. Use an explicit Done label with readable text instead. |
| Sleep | Still missing the purple summary card and moon-tile list; date/streak/progress are disconnected pieces. Labels and quality controls remain tiny and differently styled. |
| Recovery | Good 2 × 2 summary improvement. Daily entries are still grouped inside one large container, with 10px uppercase labels; board uses separated rounded rows. Increase secondary text and match the row spacing. |
| Fuel / Injuries | Meal photo and body silhouette remain unwired. The empty nutrition summary is a legitimate data state; missing imagery and collapsed recipe names are not. |
| Navigation | The sticky sibling strip remains permanently visible on grouped routes. CSS `position:sticky; top:48px` keeps it under the topbar when scrolling; the comment saying it “scrolls away” is inaccurate. It takes a persistent 40px that is absent from the board. Use the specified closed-by-default group menu, maintaining all child destinations. |
| All pages | Header dividers, heavy blank spacing above content, small legacy monospace labels and inconsistent button heights still weaken the match. Fix font loading, then unify these primitives rather than adjusting each screen independently. |
| Exercises | Captured empty category state; populated rows were not available in this isolated session. Improve empty-state guidance and selected chips, then verify a populated fixture without adding fake records to the user's data. |

## Recommended next pass

1. Fix real defects first: font loading, vanished meal names, invalid Cardio dates, header/select compression, nested overflow, keyboard disclosures.
2. Apply the shared card/segment/type primitives and remaining imagery.
3. Finish the page structures in the earlier review using the numbered boards. Preserve the changes confirmed above.
4. Recheck the affected screenshots at 1100/390/320px, all tabs and expanded details. This pass did not test 768/1440px, form submissions, persistence or race-time saving. The outstanding migration is still separate; empty lists here do not prove it has been run.

## Evidence

- `screenshots/`: 42 route/viewport screenshots plus 10 focused tab/detail screenshots.
- `observations.json`: route, font-face registration, headings, visible tabs and broad geometry measurements.
- `detail-observations.json`: actual platform fonts, precise client/scroll widths, header and disclosure measurements.
- `meal-probe.json`: confirms the 0px recipe-title defect.
- `capture-app.cjs`: reproducible capture script. Its separate Chrome profile is ignored by Git. Main command captures routes; `--details` inspects read-only tabs and disclosures; `--details --probe` isolates the meal-header measurement.

Do not treat visual captures containing real user metrics as public demo material. These artifacts remain local in the shared workspace.
