# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run all tests (Vitest)
npx vitest run path/to/file.test.jsx  # Run a single test file
```

## Architecture

**Stack**: React 18 + Vite + Tailwind CSS 3 + Recharts, targeting DeepSeek API. Pure frontend — no backend server. **JavaScript only, no TypeScript.**

### Core data flow

```
InputPanel (resume + JD text) → App.handleMatch() → api.matchResumeWithJD()
  → fetch DeepSeek API → parseResponse() → validateResult() → useMatchReducer
  → ResultPanel → ScoreRing + RadarChart/BarLegend + AnalysisCards
                                                  + OverallAssessment + ResumeOptimization
```

- **State**: `useMatchReducer` (single `useReducer` in `src/hooks/useMatchReducer.js`) manages all app state. 5 actions: `SET_RESUME`, `SET_JD`, `START_MATCH`, `MATCH_SUCCESS`, `MATCH_ERROR`. Initial state loads demo data so the page renders a full example on first load.
- **API**: `src/services/api.js` — DeepSeek chat completions. The `SYSTEM_PROMPT` constant IS the data contract; `validateResult()` IS the runtime type system. All new fields must be added to both.
- **No TypeScript**: Data structures are enforced only at runtime by `validateResult()`. When changing the API response shape, you MUST update three places: system prompt, `validateResult()`, and `src/data/demoData.js`.

### Data contract backward compatibility

`validateResult()` auto-migrates old API response formats to the current schema:
- `weaknesses[].isRequired` (boolean) → `severity` (`"critical"|"medium"|"minor"`)
- `skillSuggestions[].learningPath` (string array) → object array `[{step, output, estimatedTime}]`
- Missing `assessment`/`recommendation`/`resumeSuggestions` → auto-generated defaults

New fields should always be optional in validation to avoid breaking existing API responses.

### Component responsibilities

| Component | Owns |
|-----------|------|
| `ScoreRing` | Animated SVG ring gauge (score number only, no commentary) |
| `RadarChart` | Recharts radar plot of 5 dimensions |
| `BarLegend` | Horizontal bar chart + per-dimension one-line interpretation |
| `AnalysisCards` | Three-card row: strengths (green), weaknesses with severity badges (red), skill roadmap with step cards (blue) |
| `OverallAssessment` | Two-column: match analysis + probability estimate / verdict + reasons-to-reject |
| `ResumeOptimization` | 3 resume rewrite suggestions (original → improved + target keyword) |
| `ResultPanel` | Layout orchestrator — three rows: (score+radar), (analysis cards), (assessment+resume optimization) |

### Dimension config

5 evaluation dimensions with fixed weights, hardcoded across three files:
- `projectExperience` (35%)
- `technicalSkills` (28%)
- `domainMatch` (15%)
- `softSkills` (12%)
- `education` (10%)

`RadarChart.jsx` defines `DIMENSION_LABELS` and `BarLegend.jsx` defines `DIMENSION_CONFIG` — both must stay in sync if dimensions change. The API prompt and `validateResult()` dimension list must also be updated.

### BMAD framework

This project uses BMAD (v6.1.0) for brainstorming, planning, and workflow orchestration. Engine at `_bmad/`, outputs at `_bmad-output/`. Run `bmad-help` to see workflow status, `bmad-brainstorming` for ideation, `bmad-bmm-create-prd` for PRD generation.

### Testing

Vitest + React Testing Library + jsdom. Mock API responses use the full result shape from `demoData.js`. When adding new fields, update `src/__tests__/api.test.js` mock objects AND `src/__tests__/App.test.jsx` mock API result to match.
