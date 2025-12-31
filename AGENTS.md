# AGENTS.md

## Project Overview

maven-lightning-search is a search application for Maven workshops/talks with instructors.

## Tech Stack

- **Runtime:** Bun
- **Monorepo:** Bun workspaces (`src/*`)
- **Database:** SQLite with Drizzle ORM
- **Web:** React 19, TanStack Router, TanStack Query, Tailwind CSS v4, shadcn
- **Linting/Formatting:** Biome
- **Logging:** tslog

## Project Structure

- `src/data/` - Data scraper package (`@maven-lightning-search/data`)
- `src/db/` - Database schema package (`@maven-lightning-search/db`)
- `src/web/` - Web frontend package (`@maven-lightning-search/web`)

## Logging

Use tslog extensively throughout the codebase to aid debugging. Create one logger per module using colon-separated naming:

```
package:module
```

Examples:
- `data:scraper`
- `web:routes:talks`
- `web:lib:db`
