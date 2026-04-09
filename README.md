# CV Craft

CV Craft is a React + Vite resume builder with three main flows:

- Upload an existing resume from `PDF`, `DOC`, `DOCX`, `TXT`, or `MD`
- Paste raw resume content and let the app structure it into editable sections
- Build a resume from a guided multi-step intake form

## What It Does

- Parses uploaded resume content into structured data
- Generates editable resume drafts with six visual templates
- Supports inline editing, drag-and-drop section ordering, custom sections, and multi-page layouts
- Exports polished resumes to PDF
- Saves multiple local projects in browser storage
- Provides ATS-style keyword coverage feedback against a pasted job description
- Generates companion copy such as a cover letter draft and LinkedIn summary

## Rewrite Behavior

The rewrite tools work in two modes:

- Built-in rewrite mode: local heuristic polishing for summaries, bullets, and supporting copy
- AI-assisted rewrite mode: enabled when `VITE_AI_REWRITE_ENDPOINT` is configured

If no endpoint is configured, the app still works fully, but rewrite actions use deterministic local polishing instead of a network-backed model.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- `@dnd-kit` for editor drag-and-drop
- `pdfjs-dist` and `mammoth` for document extraction
- `html2canvas` + `jspdf` for export
- Vitest for utility-level tests

## Scripts

- `npm run dev` starts the local dev server
- `npm run build` creates the production build
- `npm run preview` previews the production build
- `npm run lint` runs ESLint
- `npm run test` runs the Vitest suite
- `npm run check` runs lint, tests, and production build together
- `npm run audit` checks dependency vulnerabilities at `moderate` severity and above

## Environment

Optional environment variables:

- `VITE_AI_REWRITE_ENDPOINT`: HTTP endpoint used for network-backed rewriting
- `VITE_ANTHROPIC_API_KEY`: enables Anthropic-backed resume parsing in the browser
- `VITE_ANTHROPIC_PARSE_MODEL`: optional override for the parsing model, defaults to `claude-sonnet-4-20250514`

Copy `.env.example` to `.env` and fill in only the values you want to enable.

## Notes

- Project state is stored locally in browser storage.
- The app is designed to remain usable even when AI rewriting is not configured.
- The current build uses manual chunking in Vite so import, export, and template tooling stay out of the initial app path.
- GitHub Actions CI runs `npm run check` and `npm run audit` on pushes and pull requests.
- GitHub Pages deploys the production `dist` build automatically on pushes to `main`.
