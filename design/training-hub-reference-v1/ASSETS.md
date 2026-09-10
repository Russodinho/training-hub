# Visual assets and prompts

All assets are saved under `public/training-hub-design/` in this repository. Raster artwork was generated with the built-in image generation tool; no API/CLI fallback was used. Icons were authored as editable SVG to match the existing stroke-based interface system.

| Asset | Use | Notes |
| --- | --- | --- |
| race-landscape.png | Dashboard next-race tile; calendar thumbnails | 1536 × 1024. Generic decorative alpine lake, not a photograph of a real race venue. Preserve aspect ratio; crop with cover. |
| oats-blueberries.png | Fuel > Meals breakfast thumbnail | Generated food photo. Only use for the matching oats/blueberries meal, not unrelated recipes. |
| body-silhouette.png | Injuries overview | 1024 × 1536 RGBA. Neutral decorative locator figure; no baked-in pain marker. Use contain; no anatomical or diagnostic claims. |
| home, calendar, plan, log, chart, run, bike, swim, strength, mobility, moon, recovery, injury, fuel, flag, settings, check, plus, chevron, water, leaf, heart, clock, upload, edit, sun (.svg) | Navigation, actions, and card glyphs | 26 icons. 24 × 24 viewBox, 1.7px stroke, round caps and joins, currentColor. Inline SVG to inherit color. |

A single landscape is deliberately reused to retain the reference's restrained artwork treatment. The requested photo is a recipe thumbnail; large photographic heroes are not part of the reference dashboard style. Functional rings, charts, status dots, inset icon tiles and gradients should be rendered with CSS/SVG/Recharts rather than rasterized UI.

## Final generation prompts

### Landscape

Use case: stylized-concept. Asset type: production race-card landscape illustration, wide 3:2. Reference images show the exact desired aesthetic: dark navy layered alpine mountains, cyan slate lake, subtle geometric polygon silhouettes, restrained atmospheric light. Generate a clean standalone scenic illustration matching the small Lakeview mountain/lake art in the supplied desktop reference. No UI, no text, no lettering, no logos, no border. Cool blue-black palette #0b151c #172a36 #284857 #56859a, muted icy cyan peaks, elegant softly shaded low-poly landscape. Lake foreground, layered mountain range on right, dark negative space left suitable for overlay text. This is generic decorative race artwork, not a factual depiction of any race venue.

### Recipe photo

Use case: photorealistic-natural. Asset type: small recipe thumbnail for dark Training Hub UI. Produce one high quality close-up photograph of a bowl of oatmeal with blueberries and a small drizzle of honey, dark charcoal ceramic bowl on blue-black slate surface. Subtle cool natural window light, appetizing true texture, restrained cyan-blue shadows matching provided Training Hub references. Top three-quarter view, single bowl centered, square composition, no cutlery clutter, no text, no logos, no interface. Do not illustrate or stylize the food.

### Injury silhouette

Use case: stylized-concept. Asset type: decorative injury overview silhouette matching the supplied dark mobile Training Hub reference. Generate one full body front-facing neutral human silhouette, arms slightly apart, legs slightly apart, no sex characteristics, no face details, no labels. Clean dark desaturated slate-blue surface with fine cyan gray outer contour and subtle dimensional shading. Centered upright, all hands and feet visible. Truly transparent background. No pain highlight: location must be overlaid dynamically by app. No text, no medical labels, no interface, no frame, no glow outside silhouette. Match the small muted blue body figure shown in the Injuries panel of supplied reference. Functional locator illustration, restrained and elegant.

