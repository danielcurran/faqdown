# faqmd — GameFAQs Walkthrough to Markdown Converter

## Purpose
Converts GameFAQs plain-text walkthroughs into clean, readable markdown files with a table of contents, internal anchor links, and properly formatted sections.

## Tech Stack
- Node.js
- `@retroachievements/api` (for achievement cross-referencing)

## Key Files
- `convert.js` — Main converter: fetch GameFAQS walkthrough, parse, format to markdown
- `split-guide.js` — Split a large walkthrough markdown into per-section files for mobile-friendly browsing
- `SKILL.md` — opencode agent skill for converting walkthroughs
- `retroachievements-skill.md` — opencode agent skill for AI-powered achievement matching
- `guide/` — Split guide output (per-section markdown files + index.md TOC)

## Conventions
- Output saved as `guide-<faq-id>.md`
- Large guides (>500KB) should be split with `split-guide.js` for mobile readability
- Split output goes in `guide/`: `index.md` + one file per section named `<section-num>-<slug>.md`
- Anchor IDs: replace dots with hyphens, prefix with `s` (e.g., `s6-4-8`)
- ASCII art wrapped in code blocks
- Equipment tables stay in code blocks, not treated as markdown tables
- TOC appears twice in source (intro + body) — only parse the intro TOC

## Usage
Convert: node convert.js <gamefaqs-print-url>
Split: node split-guide.js <input.md> [output-dir]
Achievements: use the retroachievements agent skill in opencode
