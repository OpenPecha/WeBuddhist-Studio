import { describe, expect, it } from "vitest";
import { canDeleteContent, canEditContent } from "./contentPermissions";

describe("contentPermissions", () => {
  it("allows group AUTHOR to edit but not delete DRAFT content", () => {
    expect(canEditContent("AUTHOR", "DRAFT")).toBe(true);
    expect(canDeleteContent("AUTHOR", "DRAFT")).toBe(false);
    expect(canDeleteContent("AUTHOR", "PUBLISHED")).toBe(false);
  });

  it("allows OWNER to delete DRAFT and ARCHIVED", () => {
    expect(canDeleteContent("OWNER", "DRAFT")).toBe(true);
    expect(canDeleteContent("OWNER", "ARCHIVED")).toBe(true);
  });
});
