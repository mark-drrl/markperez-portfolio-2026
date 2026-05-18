"use client";

import { type ChangeEvent, useEffect, useState } from "react";

interface PlayerState {
  isActive: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export default function WorksLsbPlayerControls() {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isActive: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
  });

  useEffect(() => {
    function handlePlayerState(event: Event) {
      const customEvent = event as CustomEvent<PlayerState>;
      setPlayerState(customEvent.detail);
    }

    window.addEventListener("lsb-player-state", handlePlayerState);

    return () => {
      window.removeEventListener("lsb-player-state", handlePlayerState);
    };
  }, []);

  function handleToggle() {
    window.dispatchEvent(new CustomEvent("lsb-player-toggle"));
  }

  function handleSeek(event: ChangeEvent<HTMLInputElement>) {
    const nextProgress = Number(event.target.value) / 1000;
    setPlayerState((current) => ({
      ...current,
      progress: nextProgress,
      currentTime: current.duration * nextProgress,
    }));
    window.dispatchEvent(
      new CustomEvent("lsb-player-seek", {
        detail: { progress: nextProgress },
      }),
    );
  }

  if (!playerState.isActive) {
    return null;
  }

  return (
    <div className="mt-7 w-[220px] text-right [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]">
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={!playerState.isActive}
          className="text-[9px] uppercase tracking-[0.22em] text-black/36 transition-colors hover:text-[#9F1F2E] disabled:pointer-events-none disabled:opacity-35"
        >
          {playerState.isPlaying ? "PAUSE" : "PLAY"}
        </button>
        <label className="relative h-3 w-28 cursor-pointer">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(playerState.progress * 1000)}
            onChange={handleSeek}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            aria-label="Seek focused reel"
          />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 overflow-hidden bg-[#9F1F2E]/24">
          <div
            className="h-full origin-left bg-[#9F1F2E] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `scaleX(${playerState.progress})` }}
          />
          </div>
        </label>
      </div>
      <p className="mt-2 text-[9px] tracking-[0.22em] text-black/28">
        {formatTime(playerState.currentTime)}
      </p>
    </div>
  );
}
