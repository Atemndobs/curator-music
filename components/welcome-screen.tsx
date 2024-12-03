"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TrackList } from "@/components/track-list";
import { useSearch } from "@/hooks/use-search";
import { useState, useEffect } from "react";
import { audioPlayer } from "@/lib/audio-player";
import { Track } from "@/lib/db";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export function WelcomeScreen() {
  const [query, setQuery] = useState("");
  const { tracks, loading, error, fetchRelatedTracks, shuffleTracks } = useSearch(query);

  // Handle error state with toast notifications
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error]);

  const handleTrackSelect = async (track: Track) => {
    try {
      // Play the selected track
      if (track.audioUrl) {
        try {
          await audioPlayer.play(track);
        } catch (playError) {
          console.error('Error playing track:', playError);
          toast({
            variant: "destructive",
            title: "Playback Error",
            description: `Unable to play "${track.title}". Please try again.`,
          });
          return;
        }
      } else {
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: `No audio available for "${track.title}".`,
        });
        return;
      }

      // Clear the search query to show related tracks instead of search results
      setQuery("");

      // Load related tracks using the selected track
      if (track.related_songs?.length) {
        await fetchRelatedTracks(track);
      }
    } catch (generalError) {
      console.error('Error handling track selection:', generalError);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tracks..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {query ? "Search Results" : "Suggested Tracks"}
        </h2>
        <TrackList 
          tracks={tracks} 
          loading={loading} 
          onShuffle={!query ? shuffleTracks : undefined}
          onTrackSelect={handleTrackSelect}
        />
      </div>
      <Toaster />
    </div>
  );
}