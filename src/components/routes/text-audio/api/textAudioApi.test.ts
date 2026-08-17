import { describe, expect, it } from "vitest";

import {
  InvalidOtrFileError,
  otrNameFromFile,
  parseOtrFile,
} from "./textAudioApi";

const makeFile = (content: string, name = "228.otr") =>
  new File([content], name, { type: "text/plain" });

describe("parseOtrFile", () => {
  it("returns the parsed content for a valid OTR file", async () => {
    const content = { text: "<p>hello</p>", media: "", "media-time": "" };

    await expect(parseOtrFile(makeFile(JSON.stringify(content)))).resolves.toEqual(
      content,
    );
  });

  it("rejects a file that is not valid JSON", async () => {
    await expect(parseOtrFile(makeFile("not json at all"))).rejects.toThrow(
      InvalidOtrFileError,
    );
  });

  it("rejects JSON that is not an object", async () => {
    await expect(parseOtrFile(makeFile('"just a string"'))).rejects.toThrow(
      InvalidOtrFileError,
    );
    await expect(parseOtrFile(makeFile("[1, 2, 3]"))).rejects.toThrow(
      InvalidOtrFileError,
    );
    await expect(parseOtrFile(makeFile("null"))).rejects.toThrow(
      InvalidOtrFileError,
    );
  });
});

describe("otrNameFromFile", () => {
  it("strips the extension", () => {
    expect(otrNameFromFile(makeFile("{}", "228.otr"))).toBe("228");
    expect(otrNameFromFile(makeFile("{}", "transcript.json"))).toBe(
      "transcript",
    );
  });

  it("keeps a name without an extension", () => {
    expect(otrNameFromFile(makeFile("{}", "transcript"))).toBe("transcript");
  });
});
