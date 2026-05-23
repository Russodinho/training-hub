import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        // Light mode tokens
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        // Activity colors
        'swim-bg': 'var(--swim-bg)',
        'swim-t': 'var(--swim-t)',
        'bike-bg': 'var(--bike-bg)',
        'bike-t': 'var(--bike-t)',
        'run-bg': 'var(--run-bg)',
        'run-t': 'var(--run-t)',
        'lift-bg': 'var(--lift-bg)',
        'lift-t': 'var(--lift-t)',
        'brick-bg': 'var(--brick-bg)',
        'brick-t': 'var(--brick-t)',
        'race-bg': 'var(--race-bg)',
        'race-t': 'var(--race-t)',
        // Phase colors
        'p1-bg': 'var(--p1)',
        'p1-t': 'var(--p1-t)',
        'p2-bg': 'var(--p2)',
        'p2-t': 'var(--p2-t)',
        'p3-bg': 'var(--p3)',
        'p3-t': 'var(--p3-t)',
        'p4-bg': 'var(--p4)',
        'p4-t': 'var(--p4-t)',
      },
      maxWidth: {
        hub: '1100px',
      },
    },
  },
  plugins: [],
}
export default config
