import { useEffect, useRef, useState } from "react";

import type { OtrSpanEntry, TextSegmentContent } from "./api/textAudioApi";

interface OtrSyncPlayerProps {
  audioUrl: string;
  spans: OtrSpanEntry[];
  segments: TextSegmentContent[];
}

interface SyncPair {
  span: OtrSpanEntry;
  segment: TextSegmentContent;
}

export const OtrSyncPlayer = ({
  audioUrl,
  spans,
  segments,
}: OtrSyncPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("seeked", onTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("seeked", onTimeUpdate);
    };
  }, [audioUrl]);

  const pairCount = Math.min(spans.length, segments.length);
  const pairs: SyncPair[] = Array.from({ length: pairCount }, (_, index) => ({
    span: spans[index],
    segment: segments[index],
  }));

  // Spans mark when each segment's reading begins, so the active segment is
  // the last one whose timestamp has already passed.
  let activeIndex = -1;
  for (let index = 0; index < pairs.length; index += 1) {
    if (pairs[index].span.timestamp <= currentTime) activeIndex = index;
    else break;
  }

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeIndex]);

  const seekTo = (timestamp: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = timestamp;
    setCurrentTime(timestamp);
  };

  if (segments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
        This text has no published segments to sync against.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={audioUrl}
        className="w-full"
      />
      {spans.length !== segments.length ? (
        <p className="rounded-md border border-amber-400/50 bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          This OTR has {spans.length} timestamp marker
          {spans.length === 1 ? "" : "s"} but the text has {segments.length}{" "}
          segment
          {segments.length === 1 ? "" : "s"} — showing the first {pairCount}{" "}
          matched in order; the rest won't be in sync.
        </p>
      ) : null}
      <div className="max-h-96 space-y-1 overflow-auto rounded-lg border p-2">
        {pairs.map((pair, index) => (
          <button
            key={pair.segment.segment_id}
            ref={index === activeIndex ? activeRef : undefined}
            type="button"
            onClick={() => seekTo(pair.span.timestamp)}
            className={`block w-full rounded-md p-2 text-left text-sm transition-colors ${
              index === activeIndex
                ? "bg-[#A51C21]/10 font-medium text-[#A51C21]"
                : "hover:bg-muted"
            }`}
          >
            {pair.segment.content}
          </button>
        ))}
      </div>
    </div>
  );
};
