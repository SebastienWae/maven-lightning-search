# AGENTS.md

## Project Overview

maven-lightning-search is a search application for Maven workshops/talks with instructors.

## Tech Stack

- **Runtime:** Bun
- **Monorepo:** Bun workspaces (`src/*`)
- **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
- **Scraper:** Cloudflare Workers
- **Web:** React 19, TanStack Router, TanStack Query, Tailwind CSS v4, shadcn (Base UI)
- **Linting/Formatting:** Biome
- **Logging:** tslog

## Project Structure

- `src/scraper/` - Scraper Worker (`@maven-lightning-search/scraper`)
- `src/db/` - Database schema (`@maven-lightning-search/db`)
- `src/web/` - Web app (`@maven-lightning-search/web`)

## Logging

Use tslog extensively throughout the codebase to aid debugging. Create one logger per module using colon-separated naming:

```
package:module
```

Examples:
- `scraper:worker`
- `scraper:scraper`
- `web:routes:talks`
- `web:lib:db`
