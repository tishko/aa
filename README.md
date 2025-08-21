# TV Shows Dashboard (Vue 3)

A small TV shows browser powered by the public TVMaze API. It supports scrolling by genre, search with autocomplete, and a detail page for each show.

## What’s inside

- **Vue 3 + `<script setup>` + TypeScript**
- **Routing:** Vue Router
- **Tests:** Vitest (unit) and Playwright (e2e)
- **Styling:** small token-based CSS (no frameworks)

## Run it

```bash
npm i   # or npm/yarn
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

Tests:

```bash
npm run test           # vitest
npm run test:e2e       # playwright (requires: npx playwright install)
npm run test:e2e:ui
```

## Configuration

The API base is fixed to public TVMaze:

```
src/common/constants.ts -> API_BASE = 'https://api.tvmaze.com'
```

No API keys required.

## Accessibility

Inputs and menus include appropriate ARIA attributes, focus states, and keyboard handling where applicable.
