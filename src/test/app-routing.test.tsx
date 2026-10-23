import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { db } from "@/api/database";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the TruckSaathi app entry route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/app");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the shipper booking route with its load-type query param", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/app/shipper/new/size?loadType=General%20Cargo");

    expect(matches.at(-1)?.routeId).toContain("/app/shipper/new/$step");
  });

  it("creates a shared capacity ledger table for partial-booking reservations", () => {
    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'capacity_ledger'")
      .get() as { name?: string } | undefined;

    expect(table?.name).toBe("capacity_ledger");
  });
});
