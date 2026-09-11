# Navigation proposal — September 11

Keep the reference palette, aqua active state, inset line icons, and slate surfaces. Replace the flat 14-link sidebar with grouped navigation. The app now has 15 routes: Coaches (/agent) is missing from both navigation configurations.

## Desktop hierarchy

Use a 224px sidebar (the old 184px rail is cramped for indented children). Home and Coaches remain direct links. Use labeled disclosure buttons for the three multi-page sections, and a direct Fuel link. The current route's section opens automatically; other sections can remain open. One level of nesting only.

```
Training Hub
Home                      /
Coaches                   /agent

Plan                    ▾
  Race Calendar           /race-calendar
  Season Plan             /season-plan
  Race Day                /race-day
Train                   ▾
  Log Workout             /log
  Training History        /training-log
  Cardio                  /cardio
Recover                 ▾
  Overview                /recovery
  Injuries                /injuries
  Mobility                /mobility
  Wind-Down               /wind-down
  Sleep                   /sleep
Fuel                      /fuel

Exercise Library          /settings/exercises
[compact upcoming race]
```

“Log Workout” versus “Training History” separates an action from reviewing results. Training History retains its existing Progress / History / Tri Sessions / Body Comp tabs; these are local tabs, not a third navigation level. Exercise Library belongs in a quiet utility area, and also gets a contextual link from Log Workout. Routes stay unchanged.

## Mobile hierarchy

Keep five fixed bottom destinations: Home · Plan · Train · Recover · Fuel. These are primary shortcuts; horizontal scrolling is unnecessary. Recover lands on /recovery, rather than /mobility. Add a labeled Menu button in the top bar to open the entire grouped route list, including Coaches and Exercise Library.

The live site already replaced the horizontal sibling strip with a collapsed `Recover pages` dropdown. Refine that into a 44px section selector above the page title: `Recover / Injuries ▾`. Tapping it opens a sheet with all five Recover links arranged vertically; the active item has an aqua background, checkmark, and aria-current. Plan and Train use the same pattern. Home, Coaches and Fuel do not need sibling selectors. Keep Fuel's existing content tabs inside the page.

The full menu and section selector use the same route registry as desktop. On direct links /agent highlights Coaches in the full menu and no unrelated bottom tab; /settings/exercises highlights Exercise Library in the menu and Train in the bottom bar. Closing a sheet returns focus to its trigger. Escape, backdrop and a labeled Close button dismiss it. Trap focus while open; restore body scrolling on close. Group buttons expose aria-expanded and aria-controls. Navigation links stay real links, at least 44px tall. Respect safe-area insets.

## Claude implementation scope

Update navConfig, Sidebar, MobileSubnav and their styles together. Include all 15 live routes and preserve redirects. Do not add overview routes or duplicate route content. Preserve the user's place when opening/closing groups. A current route must remain visibly represented even after reload or deep linking. Check keyboard navigation and 320/390/1100px layouts, including the five-link Recover menu.

This is a proposed navigation change, not yet applied to the app. The companion navigation.svg shows the desktop and phone arrangement.

## Live review evidence

Reviewed the local running app at localhost:3000, not a hosted deployment (no deployment URL is configured in CONTEXT). Captured Home, Injuries, Coaches and Season Plan at 1100, 390 and 320px. See screenshots and observations.json. Initial capture found the local server stopped; started npm run dev and repeated all captures successfully. TypeScript check: npx tsc --noEmit passed.

Confirmed misses: desktop still shows the flat 14-route list; Coaches has no direct global navigation entry or active bottom-tab state; mobile section trigger names only its group, not its current page. Coaches uses a smaller page heading than Injuries and exposes model-cycle implementation details in its introduction; use “Your daily coaching team” with a short task-focused subtitle. The new injury overview fits all three tested widths; the long detail cards remain below it and are a future candidate for accessible disclosures, with update actions visible. No coach generation buttons or data-entry actions were triggered during review.

## Injury implementation in this round

Added InjuryBodyMap with the existing generated silhouette and native-coordinate SVG overlays. Numbers link to existing injury cards. Latest update pain drives yellow (1–3), orange (4–6), red (7–10); zero is green and missing/invalid pain is neutral. These are display buckets for reported pain, not clinical severity classifications. Existing forms, history, storage and archive behavior are preserved.

Right knee is on screen-left; left ankle is on screen-right. Achilles is a dashed posterior projection explicitly labeled as such. Custom free-text locations are listed as unmapped rather than assigned speculative anatomy. If exact custom locations or a true rear view are needed, Claude should add a user-selected structured region field; free-text inference should not silently assign a body part.
