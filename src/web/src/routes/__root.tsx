import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import appCss from "../app.css?url";

const THEME_STORAGE_KEY = "theme";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Maven Lightning Lessons Search",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        children: `(function() {
          const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const theme = stored === 'dark' || (stored === 'system' || !stored) && prefersDark ? 'dark' : 'light';
          document.documentElement.classList.add(theme);
        })();`,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>
        <div className="flex flex-col gap-2">
          <Header />
          <Outlet />
        </div>
      </ThemeProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </body>
    </html>
  );
}
