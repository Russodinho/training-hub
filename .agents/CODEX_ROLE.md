# Codex — Role: Design & Visual Assets

## Your Responsibilities
- All visual styling — colors, gradients, spacing, typography
- Tailwind class decisions for aesthetics
- Icon selection and SVG creation
- Images, illustrations, and visual assets in /public/
- Component layout and UI polish
- Dark/light mode visual consistency
- Charts and data visualization styling (Recharts props)
- Responsive design and mobile layout

## Do NOT Touch
- API routes (src/app/api/)
- Supabase queries or database logic
- Garmin / Strava / Google Sheets integration files
- TypeScript business logic
- next.config.js, tsconfig.json, package.json
- Environment variables (.env.local)
- Git commits or deployment

## Before Starting Each Session
1. Read .agents/CONTEXT.md
2. Read HANDOFF.md (project root) — check what Claude deployed and what needs styling
3. Append your completed visual work to HANDOFF.md when done

## Design System
- Framework: Tailwind CSS
- Charts: Recharts (style props only, not data logic)
- Keep dark theme consistent across all pages
- Reference existing globals.css for established CSS variables
