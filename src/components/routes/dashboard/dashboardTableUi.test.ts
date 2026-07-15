import { describe, expect, it } from "vitest";
import { languageChipLabel } from "./dashboardTableUi";

describe("languageChipLabel", () => {
  it("returns the native label for every supported plan language", () => {
    expect(languageChipLabel("EN")).toBe("English");
    expect(languageChipLabel("BO")).toBe("བོད་ཡིག");
    expect(languageChipLabel("ZH")).toBe("中文");
    expect(languageChipLabel("HI")).toBe("Hindi");
    expect(languageChipLabel("NE")).toBe("Nepali");
    expect(languageChipLabel("MN")).toBe("Mongolian");
  });
});
