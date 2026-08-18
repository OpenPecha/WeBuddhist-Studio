import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OtrSyncPlayer } from "./OtrSyncPlayer";
import type { OtrSpanEntry, TextSegmentContent } from "./api/textAudioApi";

const SPANS: OtrSpanEntry[] = [
  { span: { start: 0, end: 10 }, timestamp: 0 },
  { span: { start: 10, end: 20 }, timestamp: 5 },
  { span: { start: 20, end: 30 }, timestamp: 10 },
];

const SEGMENTS: TextSegmentContent[] = [
  { segment_id: "seg-1", content: "First verse" },
  { segment_id: "seg-2", content: "Second verse" },
  { segment_id: "seg-3", content: "Third verse" },
];

const getAudio = () => document.querySelector("audio") as HTMLAudioElement;

describe("OtrSyncPlayer", () => {
  it("renders every segment's real text, not the OTR's own text", () => {
    render(
      <OtrSyncPlayer
        audioUrl="https://cdn.test/chant.mp3"
        spans={SPANS}
        segments={SEGMENTS}
      />,
    );

    expect(screen.getByText("First verse")).toBeInTheDocument();
    expect(screen.getByText("Second verse")).toBeInTheDocument();
    expect(screen.getByText("Third verse")).toBeInTheDocument();
  });

  it("highlights the segment whose timestamp has most recently passed", () => {
    render(
      <OtrSyncPlayer
        audioUrl="https://cdn.test/chant.mp3"
        spans={SPANS}
        segments={SEGMENTS}
      />,
    );
    const audio = getAudio();

    Object.defineProperty(audio, "currentTime", { value: 6, writable: true });
    fireEvent.timeUpdate(audio);

    expect(screen.getByText("Second verse")).toHaveClass("text-[#A51C21]");
    expect(screen.getByText("First verse")).not.toHaveClass("text-[#A51C21]");
    expect(screen.getByText("Third verse")).not.toHaveClass("text-[#A51C21]");
  });

  it("seeks the audio to a segment's timestamp when clicked", () => {
    render(
      <OtrSyncPlayer
        audioUrl="https://cdn.test/chant.mp3"
        spans={SPANS}
        segments={SEGMENTS}
      />,
    );
    const audio = getAudio();
    let seekedTo: number | undefined;
    Object.defineProperty(audio, "currentTime", {
      get: () => seekedTo ?? 0,
      set: (value: number) => {
        seekedTo = value;
      },
    });

    fireEvent.click(screen.getByText("Third verse"));

    expect(seekedTo).toBe(10);
  });

  it("warns when marker and segment counts don't match, and still shows the overlap", () => {
    render(
      <OtrSyncPlayer
        audioUrl="https://cdn.test/chant.mp3"
        spans={SPANS.slice(0, 2)}
        segments={SEGMENTS}
      />,
    );

    expect(screen.getByText(/2 timestamp markers/)).toBeInTheDocument();
    expect(screen.getByText(/3 segments/)).toBeInTheDocument();
    expect(screen.getByText("First verse")).toBeInTheDocument();
    expect(screen.getByText("Second verse")).toBeInTheDocument();
    expect(screen.queryByText("Third verse")).not.toBeInTheDocument();
  });

  it("shows a fallback message when the text has no segments", () => {
    render(
      <OtrSyncPlayer
        audioUrl="https://cdn.test/chant.mp3"
        spans={SPANS}
        segments={[]}
      />,
    );

    expect(
      screen.getByText(/no published segments to sync against/),
    ).toBeInTheDocument();
  });
});
