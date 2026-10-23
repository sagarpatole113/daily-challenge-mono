import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/redirect";

describe("safeNextPath", () => {
  it("allows only the authenticated area", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/dashboard/test/test-1?day=2026-09-07")).toBe("/dashboard/test/test-1?day=2026-09-07");
  });
  it("rejects open-redirect attempts and lookalikes", () => {
    for (const bad of ["https://evil.test", "//evil.test", "/\\evil", "/dashboardx", "/login", "dashboard", "/dashboard\\..", ""]) {
      expect(safeNextPath(bad)).toBe("/dashboard");
    }
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
  });
});
