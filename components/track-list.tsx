import { Track } from "@/lib/db";
import { TrackCard } from "@/components/track-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface TrackListProps {
  tracks: Track[];
  loading?: boolean;
  onShuffle?: () => void;
  onTrackSelect?: (track: Track) => void;
}

export function TrackList({ tracks = [], loading, onShuffle, onTrackSelect }: TrackListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tracks found
      </div>
    );
  }

  return (
    <div>
      {!loading && tracks.length > 0 && onShuffle && (
        <Button 
          onClick={onShuffle} 
          className="mb-4 w-full"
          variant="outline"
        >
          <span role="img" aria-label="magic wand" className="mr-2">✨</span>
          Shuffle Tracks
        </Button>
      )}
      <div className="space-y-4">
        {tracks.map((track) => (
          <TrackCard 
            key={track.id} 
            track={track} 
            onSelect={onTrackSelect}
          />
        ))}
      </div>
    </div>
  );
}