import { createFileRoute } from "@tanstack/react-router";
import { Logger } from "tslog";
import { getTalks, talksSearchSchema } from "@/utils/talks";

const log = new Logger({ name: "web:routes:download" });

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const Route = createFileRoute("/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        log.debug("CSV download requested", { search: url.search });

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

        log.debug(`Generating CSV for ${talks.length} talks`);

        const header = [
          "Title",
          "Description",
          "Start Time",
          "Duration (min)",
          "Tags",
          "Instructors",
          "Status",
          "Link",
        ];
        const rows = talks.map((talk) => [
          talk.title,
          talk.description,
          talk.startTime.toISOString(),
          String(talk.durationMin),
          talk.tags.map((t) => t.name).join("; "),
          talk.instructors.map((i) => i.name).join("; "),
          talk.status,
          `https://maven.com/p/${talk.slug}/`,
        ]);

        const csvContent = [header, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");

        return new Response(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="maven-talks.csv"',
          },
        });
      },
    },
  },
});
