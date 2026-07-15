import { useCallback, useEffect, useRef, useState } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { formatMs } from "@/lib/utils";
import { FaPlay, FaPause } from "react-icons/fa6";

interface AudioTrimmerProps {
  audioUrl: string;
  maxDurationMs: number;
  startMs: number | null;
  endMs: number | null;
  onChange: (startMs: number | null, endMs: number | null) => void;
  onClear?: () => void | Promise<void>;
  disabled?: boolean;
}

const MIN_SEGMENT_MS = 500;

export const AudioTrimmer = ({
  audioUrl,
  maxDurationMs,
  startMs,
  endMs,
  onChange,
  onClear,
  disabled = false,
}: AudioTrimmerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localStart, setLocalStart] = useState(startMs ?? 0);
  const [localEnd, setLocalEnd] = useState(endMs ?? maxDurationMs);

  useEffect(() => {
    setLocalStart(startMs ?? 0);
    setLocalEnd(endMs ?? maxDurationMs);
  }, [startMs, endMs, maxDurationMs]);

  const commitRange = useCallback(
    (start: number, end: number) => {
      const clampedStart = Math.max(
        0,
        Math.min(start, maxDurationMs - MIN_SEGMENT_MS),
      );
      const clampedEnd = Math.max(
        clampedStart + MIN_SEGMENT_MS,
        Math.min(end, maxDurationMs),
      );
      setLocalStart(clampedStart);
      setLocalEnd(clampedEnd);
      onChange(clampedStart, clampedEnd);
    },
    [maxDurationMs, onChange],
  );

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.currentTime * 1000 >= localEnd) {
        audio.pause();
        audio.currentTime = localStart / 1000;
        setIsPlaying(false);
      }
    };

    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [localStart, localEnd]);

  useEffect(() => {
    stopPlayback();
  }, [audioUrl, stopPlayback]);

  const playSelection = async () => {
    const audio = audioRef.current;
    if (!audio || disabled) return;
    audio.currentTime = localStart / 1000;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || disabled) return;
    if (isPlaying) {
      stopPlayback();
      return;
    }
    await playSelection();
  };

  const handleClear = async () => {
    stopPlayback();
    if (onClear) {
      await onClear();
    } else {
      onChange(null, null);
    }
  };

  const startPercent =
    maxDurationMs > 0 ? (localStart / maxDurationMs) * 100 : 0;
  const endPercent = maxDurationMs > 0 ? (localEnd / maxDurationMs) * 100 : 100;

  return (
    <div className="space-y-3 rounded-md border border-dashed border-gray-300 dark:border-input bg-[#FAFAFA] dark:bg-sidebar-secondary p-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        className="hidden"
      />

      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>Day audio segment</span>
        <span>
          {formatMs(localStart)} – {formatMs(localEnd)} ({localEnd - localStart}{" "}
          ms)
        </span>
      </div>

      <div className="relative h-10 rounded-md bg-[#E8E8E8] dark:bg-[#2a2a2a] overflow-hidden">
        <div
          className="absolute inset-y-0 bg-[#A51C21]/25 border-x-2 border-[#A51C21]"
          style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex justify-between">
          <span>Start</span>
          <span>{formatMs(localStart)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={maxDurationMs}
          step={100}
          value={localStart}
          disabled={disabled}
          className="w-full accent-[#A51C21]"
          onChange={(e) => {
            const next = Number(e.target.value);
            commitRange(next, Math.max(next + MIN_SEGMENT_MS, localEnd));
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex justify-between">
          <span>End</span>
          <span>{formatMs(localEnd)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={maxDurationMs}
          step={100}
          value={localEnd}
          disabled={disabled}
          className="w-full accent-[#A51C21]"
          onChange={(e) => {
            const next = Number(e.target.value);
            commitRange(Math.min(next - MIN_SEGMENT_MS, localStart), next);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Pecha.Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <FaPause className="w-3 h-3 mr-1" />
          ) : (
            <FaPlay className="w-3 h-3 mr-1" />
          )}
          {isPlaying ? "Pause" : "Play segment"}
        </Pecha.Button>
        <Pecha.Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={handleClear}
        >
          Clear timestamps
        </Pecha.Button>
      </div>
    </div>
  );
};
