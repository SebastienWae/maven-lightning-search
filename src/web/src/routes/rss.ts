import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Logger } from "tslog";
import { getTalks, talksSearchSchema } from "@/utils/talks";

const log = new Logger({ name: "web:routes:rss" });

export const Route = createFileRoute("/rss")({
  validateSearch: zodValidator(talksSearchSchema),
  loaderDeps: ({ search }) => search,
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        log.debug("RSS feed requested", { search: url.search });

        const parseJsonArray = <T>(value: string | null): T[] => {
          if (!value) return [];
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        };

        const params = talksSearchSchema.parse({
          page: url.searchParams.has("page") ? Number(url.searchParams.get("page")) : undefined,
          limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined,
          sortBy: url.searchParams.get("sortBy") || undefined,
          sortOrder: url.searchParams.get("sortOrder") || undefined,
          search: url.searchParams.get("search") || undefined,
          tags: parseJsonArray<number>(url.searchParams.get("tags")),
          instructors: parseJsonArray<string>(url.searchParams.get("instructors")),
          status: parseJsonArray<string>(url.searchParams.get("status")),
        });

        const { talks } = await getTalks({ data: params });

        log.debug(`Generating RSS for ${talks.length} talks`);

        const items = talks
          .map(
            (talk) => `
    <item>
      <title><![CDATA[${talk.title}]]></title>
      <description><![CDATA[${talk.description}]]></description>
      <link>https://maven.com/p/${talk.slug}/</link>
      <pubDate>${talk.startTime.toUTCString()}</pubDate>
      <guid isPermaLink="true">https://maven.com/p/${talk.slug}/</guid>
    </item>`,
          )
          .join("");

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Maven Lightning Lessons</title>
    <description>Maven Lightning Lessons Search Results</description>
    <link>${url.origin}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

        return new Response(rss, {
          headers: {
            "Content-Type": "application/rss+xml",
          },
        });
      },
    },
  },
});
