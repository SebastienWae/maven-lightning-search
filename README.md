# Maven Lightning Search

A search application for discovering and exploring Maven workshops/talks with instructors. Built with modern web technologies and deployed on Cloudflare.

## Features

- **Full-text search** - Search workshops by title and description
- **Advanced filtering** - Filter by tags, instructors, and status (Scheduled/Live/Recorded)
- **Sortable results** - Sort by start time or duration (ascending/descending)
- **Pagination** - Configurable rows per page (10, 20, 50, 100)
- **CSV export** - Download filtered results as CSV
- **RSS feed** - Subscribe to filtered results via RSS
- **Featured talks** - Highlighted workshops marked as featured

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | [Bun](https://bun.sh) |
| Monorepo | Bun workspaces |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Frontend | [React 19](https://react.dev) |
| Routing | [TanStack Router](https://tanstack.com/router) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| SSR | [TanStack Start](https://tanstack.com/start) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) (Base UI) |
| Scraper | [Cloudflare Workers](https://workers.cloudflare.com) |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) |
| Linting | [Biome](https://biomejs.dev) |
| Logging | [tslog](https://tslog.js.org) |


## Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (for D1 database and deployment)

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Run Cloudflare setup

Create a [Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens) with the following permissions:
- **D1**: Edit
- **Account Settings**: Read

Add the token to your `.env` (create the file if needed):

```bash
# .env
CLOUDFLARE_API_TOKEN=...
```

Then run the setup script:

```bash
bun run setup_cf.ts
```

This will automatically:
- Create a D1 database (`maven_search_prod`)
- Overwrite `.env` with your credentials
- Create `wrangler.jsonc` configuration files

You’ll also need to authenticate Wrangler for migrations and deployment:

```bash
bunx wrangler login
```

### 3. Set up the database

Generate and run migrations:

```bash
# Generate migrations from schema
bun drizzle-kit generate

# Run migrations on remote D1
bun drizzle-kit migrate
```

For local development, prefix commands with `LOCAL=1`:

```bash
LOCAL=1 bun drizzle-kit migrate   # Run migrations locally
LOCAL=1 bun drizzle-kit studio    # Open Drizzle Studio
```

### 4. Seed the database

Start the scraper locally and trigger a scrape:

```bash
bun run scrape:dev
curl http://localhost:8080/trigger
```

## Development

### Web application

```bash
bun run web:dev
```

Opens at [http://localhost:3000](http://localhost:3000)

### Scraper (local)

```bash
bun run scrape:dev
```

The scraper runs as a Cloudflare Worker with:
- **Cron trigger**: Automated scheduled scraping
- **HTTP trigger**: Manual scrape via `GET /trigger`

### Quality checks

```bash
bun run check
bun run type-check
```

To auto-fix lint/format issues, run `bun run check:fix`.

## Deployment

### Deploy the scraper

```bash
bun run scrape:deploy
```

Deploys the scraper as a Cloudflare Worker with scheduled cron triggers.

### Deploy the web app

```bash
bun run web:deploy
```

Builds and deploys to Cloudflare Pages.

## Common Scripts

| Script | Description |
|--------|-------------|
| `bun install` | Install dependencies |
| `bun run web:dev` | Run the web app locally |
| `bun run scrape:dev` | Run the scraper locally |
| `bun run check` | Lint + format checks (Biome) |
| `bun run check:fix` | Auto-fix lint/format issues |
| `bun run type-check` | TypeScript type checking |

For the full list of scripts, see [`package.json`](package.json).


## License

MIT License. See [LICENSE](LICENSE) for details.
