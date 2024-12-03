"use client";

import React, { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Volume1, 
  VolumeX,
  Gauge,
  Smile,
  Zap,
  Music
} from 'lucide-react';
import { audioPlayer, AudioPlayerState } from '@/lib/audio-player';
import { Track } from '@/lib/db';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import '@/styles/curator-player.css';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function CuratorPlayerCard() {
  const [playerState, setPlayerState] = useState<AudioPlayerState>({ 
    playing: false 
  });
  const [volume, setVolume] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe(setPlayerState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (playerState.track) {
      audioPlayer.sound?.volume(volume);
    }
  }, [volume, playerState.track]);

  const togglePlayPause = () => {
    if (playerState.playing) {
      audioPlayer.pause();
    } else {
      audioPlayer.resume();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerState.track || !playerState.duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const seekTime = percentage * (playerState.duration || 0);

    audioPlayer.seek(seekTime);
  };

  if (!playerState.track) {
    return null;
  }

  const track = playerState.track;
  const progress = playerState.duration 
    ? (playerState.position || 0) / playerState.duration * 100 
    : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-4 z-50 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
      {/* Album Art */}
      <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
        <div className="w-[80px] h-[80px] relative">
          {playerState.track?.albumArt && (
            <Image 
              key={playerState.track.id} 
              src={playerState.track.albumArt} 
              alt={playerState.track.title} 
              width={80} 
              height={80} 
              className="rounded-md object-cover"
              priority
            />
          )}
        </div>
        <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
          {playerState.track && (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Smile className="h-4 w-4 text-muted-foreground" />
                  {/* <span>Mood</span> */}
                </div>
                <span>{playerState.track.mood}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  {/* <span>Energy</span> */}
                </div>
                <span>
                  {playerState.track.energy < 0.5 ? 'Low' : 
                  'Average'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  {/* <span>Key</span> */}
                </div>
                <span>{playerState.track.key || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </div>
                <span>{playerState.track.bpm}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center space-y-2 w-full sm:flex-grow">
        {/* Track Info Above Controls */}
        <div className="flex flex-col items-center justify-center overflow-hidden">
          <h2 className="text-sm font-semibold text-center truncate max-w-full">{playerState.track?.title}</h2>
          <p className="text-sm text-gray-300 truncate max-w-full">{playerState.track?.artist}</p>
        </div>

        <div className="flex items-center justify-center space-x-4 w-full">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Shuffle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            className="bg-white text-black hover:bg-gray-200 scale-125"
            onClick={togglePlayPause}
          >
            {playerState.playing ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <SkipForward className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hidden sm:inline-flex"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart 
              className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2 w-full px-4">
          <span className="text-xs w-10 text-right">
            {formatTime(playerState.position || 0)}
          </span>
          <div 
            className="flex-grow h-1 bg-gray-700 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-1 bg-white rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs w-10 text-left">
            {formatTime(playerState.duration || 0)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      {playerState.track && (
        <div className="hidden sm:flex flex-col items-center space-y-2">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-1 h-24 bg-gray-700 rounded-full appearance-none cursor-pointer volume-slider"
            title="Volume Control Slider"
          />
          <Button variant="ghost" size="icon">
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
