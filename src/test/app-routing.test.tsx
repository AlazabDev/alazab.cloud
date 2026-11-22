import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

describe("Alazab Cloud routes", () => {
  it.each(["/settings", "/storage"])("matches a page for %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(path).at(-1)?.routeId).toBe(path);
  });
});

describe("File gallery routes", () => {
  it.each([
    ["/auth", "/auth"],
    ["/reset-password", "/reset-password"],
    ["/azdocs", "/_authenticated/azdocs"],
    ["/files", "/_authenticated/files/"],
    ["/files/projects", "/_authenticated/files/projects/"],
    ["/files/projects/abc", "/_authenticated/files/projects/$projectId"],
    ["/files/gallery", "/_authenticated/files/gallery"],
    ["/files/documents/abc", "/_authenticated/files/documents/$documentId"],
    ["/files/approvals", "/_authenticated/files/approvals"],
    ["/files/shares", "/_authenticated/files/shares"],
    ["/files/archive", "/_authenticated/files/archive"],
    ["/files/users", "/_authenticated/files/users"],
    ["/share/abc", "/share/$token"],
  ])("matches a page for %s", (path, routeId) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(path).at(-1)?.routeId).toBe(routeId);
  });
});
