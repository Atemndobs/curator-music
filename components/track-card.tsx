"use client";

import { Play } from "lucide-react";
import { Track } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { audioPlayer } from "@/lib/audio-player";
import { useState } from 'react';

interface TrackListProps {
  tracks: Track[];
  onShuffle: () => void;
}

interface TrackCardProps {
  track: Track;
  onSelect?: (track: Track) => void;
}

export function TrackList({ tracks, onShuffle }: TrackListProps) {
  return (
    <div>
      <Button onClick={onShuffle} className="mb-4">
        <span role="img" aria-label="magic wand">✨</span> Randomize
      </Button>
      <div className="grid grid-cols-1 gap-4">
        {tracks.map((track, index) => (
          <TrackCard key={index} track={track} />
        ))}
      </div>
    </div>
  );
}

export function TrackCard({ track, onSelect }: TrackCardProps) {
  if (!track) {
    return null;
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when play button is clicked
    if (track.audioUrl) {
      audioPlayer.play(track);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(track);
    }
  };

  const {
    albumArt = '/images/default-album-art.png',
    title = 'Untitled',
    artist = 'Unknown Artist',
    bpm = 0,
    mood = '',
    key = '',
  } = track;

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="relative h-16 w-16 flex-shrink-0">
          <Image
            src={albumArt}
            alt={`${title} album art`}
            fill
            className="object-cover rounded"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {artist}
          </p>
          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
            {bpm > 0 && (
              <>
                <span>{bpm} BPM</span>
                <span>•</span>
              </>
            )}
            {mood && (
              <>
                <span>{mood}</span>
                <span>•</span>
              </>
            )}
            {key && <span>{key}</span>}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={handlePlay}
          disabled={!track.audioUrl}
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}