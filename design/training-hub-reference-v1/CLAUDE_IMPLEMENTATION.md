# Implement the approved reference direction

**Correction-pass precedence:** Read [IMPLEMENTATION_REVIEW.md](IMPLEMENTATION_REVIEW.md) first. Its resolved measurement/layout contract supersedes optional layouts and narrower form widths in this earlier brief. Preserve the content and behavior requirements below.

**Correction-pass precedence:** Read [IMPLEMENTATION_REVIEW.md](IMPLEMENTATION_REVIEW.md) first. Its resolved measurement/layout contract supersedes optional layouts and narrower form widths in this earlier brief. Preserve the content and behavior requirements below.

## Visual priority

Read `README.md`, then open both images in `references/`, then inspect the matching board before changing each page. The original images define the visual language. The boards define adaptation to this repository. Existing working capabilities define content. Do not interpret mockup sample values, button captions, or chart geometry as new application logic.

Match the references' blue-black page background; subtly blue, shaded cards; crisp slate borders; aqua gradient primary buttons; rounded segmented controls; white sans-serif headings; muted blue-gray secondary labels; colored sport pictograms in inset squares; and restrained purple recovery accents. Avoid the current tiny, tracked, uppercase monospace treatment for headings and regular UI. Do not introduce an unrelated theme, oversized marketing hero, bright white cards, or decorative gradients across the entire page.

The composites are raster images with no source design tokens or font metadata. Exact original CSS cannot be recovered from them. The supplied token values are the implementation targets chosen to reproduce their appearance; compare the actual rendered app against the originals before claiming an exact match.

## Shared shell and sizing

- Desktop, 1024px and wider: persistent 184–208px left sidebar, slate-blue surface, 24px content inset, 16px grid gap. Main content max-width 1100px. Keep each current destination reachable. Header title 26–28px/600–700, subtitle 14px, card title 16–18px/600, body 14–16px, secondary metadata 12–13px. Figtree throughout; tabular numerals for metrics. Do not recreate the macOS traffic lights, fictional search field, avatar, or outer presentation banner in the reference image.
- Narrow tablet: collapse sidebar to mobile navigation when it would crowd content. Two columns only when each remains comfortably usable. Metric tiles may wrap to 2 × 2.
- Mobile, 390px target and 320px minimum: 20px side inset (16px at 320px); one content column; 24–26px title; 14px regular text. Five bottom destinations, icons above labels, active aqua. Pinned bar 60–68px plus safe-area inset; page padding must prevent it covering controls. The tall board depicts scroll content, not a requirement to fit everything in one phone viewport.
- Mobile group links must expose their child destinations through an accessible menu or in-page navigation. Plan includes Calendar, Season, Race Day; Train includes Workout Log, Training Log, Cardio; Recover includes Mobility, Wind-Down, Sleep, Recovery, Injuries. Exercises remains reachable through the app's settings navigation. The current mobile tab grouping puts Race Day under Fuel; correct that presentation mapping to Plan without altering its route.
- Cards: radius 10–12px, 1px slate outline, `linear-gradient(135deg,#1a2a35,#13212a)`, 16–18px padding. Nested fields use `#1b2d38`. Compact row 64–72px minimum, expandable if text wraps. Do not hardcode board heights into production.
- Primary action: gradient `#65f3ec` to `#22dcd4`, dark text, 8px desktop corner and up to 20px mobile pill corner. Minimum touch area 44px. Board buttons are schematic 40px bodies; add real minimum hit area. Secondary action: slate fill, thin border, white text. Destructive actions: coral text plus explicit label, not the normal aqua treatment.
- Selection: aqua segment with dark text; inactive slate segment with light label. Selected desktop nav uses translucent deep teal `#164951` and aqua icon. Green completion circle contains a dark check. Incomplete checkbox has a visible slate/gray ring.
- Icons: use supplied 24px viewBox paths inline so `currentColor` works. 18px sidebar glyph, 20px bottom nav glyph, 24px card glyph in a 36–40px rounded tile. A plain `<img>` will not inherit CSS `currentColor`; inline SVG or a mask is required. Give interactive icons accessible labels; hide decorative SVGs from assistive technology.

## Consistent semantic colors

Use aqua for primary controls and Run, cyan-blue for Swim, warm amber for Bike, lavender for Strength, green for Mobility/completed states, purple for Sleep/Wind-Down, coral for injury/pain/destructive states. The references vary sport colors between panels; use the mobile reference as the tie-breaker. Keep navigation accent independent from strength. Refactor legacy aliases carefully: `--strength` currently doubles as the app accent and must not turn all primary buttons purple. Preserve existing medical/score threshold calculations and distinguish statuses with text as well as color.

## Chart and ring treatment

Charts remain live Recharts components. Transparent chart area inside blue-black card, very subtle horizontal grid, 12px readable axes, rounded 3px bar tops, narrow bars with visible gaps. Chart legends must identify series; label axis units and range. Use real stored values, current aggregation, and real empty states. Dashboard volume is grouped/stacked Swim/Bike/Run, not the one-color schematic in the board. Lifts retain their existing progress chart and selectors. Do not substitute decorative bars for live charts.

Progress rings use a dark slate track, 8–10px round-capped stroke, centered value and secondary caption. Prefer CSS/SVG geometry over raster images. Derive numerator and denominator from existing state; null means an em dash, not zero or an invented score. Clamp drawn percentage while retaining the true numeric label. Keep the system's existing recovery metrics rather than inventing readiness or HRV inputs shown in the references.

## Page-by-page implementation

### 01 — Dashboard `/`

Desktop: next-race scenic tile and Today's Workout occupy two balanced top columns; timeline sits beside recovery summary; below, weekly volume and distribution share a row, followed by body composition and recent activities. Preserve existing schedule, day/workout links, training week/off-season status, body-comp fallback and quick links. Mobile order: greeting, race/countdown, workout CTA, today's timeline, purple recovery summary, weekly progress, remaining charts and body comp, recent activities. Show actual race name/date instead of the board's generic copy. The reference's four-part countdown is a visual pattern; retain supported countdown precision unless Claude deliberately implements and tests a ticking countdown. No race: a compact calendar link, no made-up countdown. CTA routes to the appropriate existing logging surface.

### 02 — Race Calendar `/race-calendar`

Header and Add Race CTA, chronological race cards with 70–80px scenic thumbnails, actual name/date/location/type, three sport distances, active-race state, and existing removal action. The same generic artwork may be reused decoratively; it is not a photo of a named venue. Desktop may use wide rows; mobile keeps readable stacked metadata. Add Race opens the existing form styled as a full-width card or sheet: name, date, location, type and swim/bike/run distances; maintain all current validation and actions. The board shows only the upper form fields, not permission to drop remaining inputs. No invented A/B race filters or Completed filter unless already supported. No drag-and-drop requirement.

### 03 — Season Plan `/season-plan`

Keep Tri Plan / Stretch Goals tabs. Tri Plan: countdown/status; four colored phase tiles using current Re-entry, Build + Brick Intro, Race Sharpening, Taper; current weekly plan details. At desktop, week days can be seven compact columns where content fits. On mobile, selected week becomes stacked day cards with sport glyphs and duration/distance. Preserve all existing phase notes, actual dates, race targets, and off-season behavior. The board's phase names are shortened only for narrow tile labels.

Stretch Goals: desktop 2-column cards for swim distance progression, brick progression, off-bike run progression and season goals; mobile stack in that order. Add each real milestone as a compact row with existing completion state, target/date and note. Open-water readiness remains a visible checklist at the end. Do not add phase creation, draggable schedules, or arbitrary new season dates based on the reference artwork.

### 04 — Workout Log `/log`

Keep this as the working strength logger; the mobile reference's generic Run form is a style reference, not replacement functionality. Date at top, horizontally scrollable existing workout-type chips, then exercise cards containing editable sets, reps, weights, RPE and the existing fields. Desktop cap the entry column around 700px instead of stretching small inputs over the entire screen; mobile use full width. Show previous weights in subdued text. Preserve add/remove set, skip exercise, custom exercises from Settings, session notes, saving/saved/error states. Save Workout is prominent at the end; optional sticky mobile action must respect keyboard and nav insets. Do not add a workout-template builder without separate authorization.

### 05 — Training Log `/training-log`

Keep all four tabs: Lifts, Tri Sessions, Body Comp, History. The board's mixed rows communicate styling, not content to combine under Lifts.

- Lifts: existing session/set/week summary, progress chart and selectors. Existing source attribution and empty state remain.
- Tri Sessions: four sport cards (swim, bike, run, brick), existing goals/progress and manual entry controls; compact entry rows below. Desktop 2-column grouping; mobile stack. Keep distance/duration units explicit and all edit/delete capabilities.
- Body Comp: imported Cronometer chart/table above manual weight log and form. Preserve auto weight fallback where currently supported. No fabricated sample data.
- History: newest-first session rows with date, workout name and summary; expanding a row displays the actual recorded sets and notes in a nested table/card. Keep the new Supabase readback from Claude's audit.

### 06 — Cardio `/cardio`

Header with existing date-range selector, three summary tiles for this week/activities/total time, existing activity visualizations and Garmin activity list. If the existing view has no chart for a metric, use its current information structure; do not invent zone/fitness analytics merely to mimic the reference. Swim/Bike/Run use the new semantic palette consistently. Wide rows on desktop; mobile compact sport tile, title, date, distance/duration then details. Retain current filtering, sync/source messaging, pagination or expansion if present, and empty/error states.

### 07 — Fuel `/fuel`

Keep Targets / Meals / Supplements. Board combines previews to show reusable styles; production keeps content in its actual tabs.

- Targets: import card/CTA for **Cronometer CSV**, existing upload state and actuals-versus-targets; rings are appropriate only for available, correctly computed values. Preserve high/low/Saturday lever rules, all base foods, daily-target table and existing strategy notes. A target without an actual is labeled Target; no filled progress ring. Desktop 2-column import/summary with full-width daily table; mobile rings scale or wrap, then data rows.
- Meals: breakfast/lunch/dinner sub-tabs, recipe cards with name and existing macros/servings. Only the oats/blueberries recipe uses the supplied photo; other meals use the fuel glyph until suitable real assets exist. Expanded recipe: ingredients/quantity table then numbered method. Desktop ingredients and method may sit side by side; mobile stack. Preserve all recipes and quantities.
- Supplements: time-grouped rows with supplement, existing dosage/details and timing; existing principles below as cards. Style existing information without adding or revising health recommendations. No fictional live sync to MyFitnessPal, Strava, or TrainingPeaks.

### 08 — Mobility `/mobility`

Progress card with green ring, required count and streak, reset action. Nine exercise cards in source order. Desktop may use 2 columns for detailed expanded cards; the board shows compact row treatment. Mobile uses single rows that expand for focus, sets, duration, cues, tools and existing massage-gun notes. Existing short routine on non-gym days requires only exercises 08/09; retain optional labels for the other seven, keep their text readable, and use the correct denominator. Completion, reset and educational explanation remain. No fake Start Routine timer is needed.

### 09 — Sleep Protocol `/sleep`

Use the reference's purple recovery styling but retain the actual manual nightly protocol. Date selector, streak, progress, four timed check rows, lights-out input, five-point quality control, notes, Save Log. Keep all real instructional subtext, source time targets and error feedback. Desktop form max-width 640–700px, mobile full width. Completed tasks have a green check and preserve legible labels. Sleep score/HRV charts belong only where measured data already exists, not fabricated on this protocol page.

### 10 — Recovery `/recovery`

7/14/30-day selector and current four metrics: average sleep score, average maximum body battery, average resting HR, average stress. Desktop 4 metric tiles then the real five-column daily table. Mobile 2 × 2 summary tiles then day cards with all four values explicitly labeled; preserve existing expandable day detail. Use purple sleep accent, aqua HR, green battery, amber stress, while keeping current threshold coloring. This route is distinct from manual Sleep Protocol. Garmin loading/no-data/error states must be truthful. Do not present a missing sync as healthy recovery.

### 11 — Wind-Down `/wind-down`

Purple summary ring and short purpose text, five ordered passive-stretch cards, then ground rules. Match Mobility card construction but use moon/purple accents and relaxed spacing. Preserve all existing stretch duration badges, cues, breathing instructions, completion behavior, and restrictions; the compact board is not permission to discard instructions. Desktop 2 columns for expanded cards or one focused column; mobile one column. Provide a moon icon in the sidebar, currently missing in the icon map. No invented countdown timer or new workout routine.

### 12 — Injuries `/injuries`

Header with Add Injury. Desktop overview splits decorative silhouette/status area and active injury details; mobile silhouette sits beside the selected card, followed by updates. The silhouette is a neutral decorative illustration. Current injuries store free-text locations, so do **not** imply a working body-map selection or place a pain dot at an invented location. Accurate mapped dots require a real location mapping and separate implementation. Keep name/since/location/pain/aggravators/not-affected/treatment fields, update history and notes, add update, archive, and past injuries. Add/edit forms use the same inset-field style, preserve validation. Coral severity labels never replace the actual pain number. No new diagnosis or rehab prescription.

### 13 — Race Day `/race-day`

Actual selected race summary with Swim → T1 → Bike → T2 → Run strip. Desktop split morning timeline/strategy and kit checklist; mobile chronological stack, with strategy and transition tips following their relevant stage. Preserve race selection, all source targets, fueling/logistics and all-races list. Checkable content remains checkable only if supported by existing behavior. No active race: style current Season Complete state with a race-calendar link, not a fabricated upcoming race. The board's sample time labels are not real scheduled times.

### 14 — Exercises `/settings/exercises`

This app has exercise settings, not the reference's fictional full integrations/settings hub. Keep all six existing categories: Upper Push, Upper Pull, Lower Quad, Lower Glute/Ham, Core, Conditioning. On mobile categories scroll horizontally; the board's More is shorthand, not a new lost-destination menu. Exercise rows show name, defaults and Edit / Enable / Disable. Inactive rows retain readable labels and an Inactive badge rather than 40% opacity for the whole row. Add/edit shows name/category/sets/reps/RPE/rest plus any existing fields, Save/Cancel, validation and save errors. Desktop max-width around 760px; mobile fields use two columns only while labels fit. Do not add profile, notifications, account connections or appearance settings.

## States, accessibility and implementation sequence

1. Preserve Claude's existing uncommitted changes. First style the shared shell, fonts, token aliases, cards, buttons, input fields, glyphs and chart defaults. Then implement the main page groups and detailed tabs. Keep each page's current data fetching and persistence intact.
2. Loading: stable-height slate skeletons without fake numbers. Empty: concise explanation and the relevant existing action. Error: readable coral message next to the failing operation with retry where supported. Saving: disabled labeled action; successful save: brief confirmation. Do not leave a button apparently successful after a failed write.
3. Desktop forms appear in context or a dialog with focus containment. Mobile forms may use a full-height sheet with visible Close/Cancel and scrollable body. Keep existing destructive confirmation behavior, explicit labels, keyboard operation and focus restoration.
4. Long names wrap; rows grow; input labels remain visible. At 200% text size, use content-driven height. Focus outline 2px pale aqua with 3px offset. Respect reduced motion. Never encode an injury status, sport or completed state by color alone. Verify text contrast after applying real font sizes; small subdued text is still actionable information.
5. Finish by comparing every route at desktop and mobile against the original references and matching board. Check 320/390/768/1440px widths, keyboard focus, long content, all tabs, empty/error/saved states, no bottom-nav obstruction and chart labels/units. This is Claude's implementation QA; the delivered static boards do not certify the live app.
6. Run the repository build after implementation. Preserve the existing migration task from the handoff: `supabase/migrations/0001_manual_logs.sql` still needs live execution. Do not label manual log/injury persistence verified without the required tables.

No application files have been restyled by this design handoff. Do not mark the redesign complete until the actual app has been implemented and visually checked.
