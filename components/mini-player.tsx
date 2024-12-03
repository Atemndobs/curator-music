"use client";

import { useEffect, useState } from "react";
import { Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { audioPlayer, type AudioPlayerState } from "@/lib/audio-player";
import { cn } from "@/lib/utils";

export function MiniPlayer() {
  const [state, setState] = useState<AudioPlayerState>({ playing: false });

  useEffect(() => {
    return audioPlayer.subscribe(setState);
  }, []);

  if (!state.track) {
    return null;
  }

  const handlePlayPause = () => {
    if (state.playing) {
      audioPlayer.pause();
    } else {
      audioPlayer.resume();
    }
  };

  const handleSeek = (values: number[]) => {
    audioPlayer.seek(values[0]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
      <div className="container flex items-center gap-4 py-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{state.track.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {state.track.artist}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePlayPause}
          >
            {state.playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          {state.duration && (
            <div className="w-24 hidden sm:block">
              <Slider
                value={[state.position || 0]}
                max={state.duration}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}