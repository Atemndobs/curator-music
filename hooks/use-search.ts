import { useState, useEffect, useRef } from "react";
import { Track } from "@/lib/db";
import { searchTracks, getRelatedTracks, SearchResponse } from "@/lib/api";
import { SEARCH_API_URL } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useSearch(currentQuery: string = '') {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(currentQuery);
  
  // Ref to store the full shuffled track pool
  const shufflePoolRef = useRef<SearchResponse['hits']>([]);
  const shuffleIndexRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    setError(null);

    const fetchInitialTracks = async () => {
      try {
        setLoading(true);
        const response = await fetch(SEARCH_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer masterKey',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: '',
            limit: 10,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch initial tracks');
        }

        const data = await response.json();
        if (mounted && data.hits?.length > 0) {
          const shuffled = data.hits.sort(() => 0.5 - Math.random());
          const selectedTracks = shuffled.slice(0, 3).map((hit: SearchResponse['hits'][0]) => ({
            id: hit.id.toString(),
            slug: hit.slug,
            title: hit.title,
            artist: hit.author,
            albumArt: hit.image,
            bpm: hit.bpm,
            mood: (hit.happy ?? 0) > (hit.sad ?? 0) ? 'happy' : 'sad',
            key: [hit.key, hit.scale].filter(Boolean).join(' '),
            genre: Array.isArray(hit.genre) ? hit.genre.join(', ') : hit.genre,
            audioUrl: hit.path,
            energy: hit.energy,
            danceability: hit.danceability,
            duration: 0, // Add duration calculation if needed
            cached: false,
            related_songs: [], // Transform related_songs if needed
          }));
          setTracks(selectedTracks);
        }
      } catch (error) {
        console.error('Error fetching initial tracks:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(`Failed to load initial tracks: ${errorMessage}`);
        setTracks([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const doSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add minimum loading time of 1 second
        const searchPromise = searchTracks(currentQuery);
        const delayPromise = new Promise(resolve => setTimeout(resolve, 1000));
        
        // Wait for both the search and the minimum delay
        const [results] = await Promise.all([searchPromise, delayPromise]);

        if (mounted) {
          if (results && results.length > 0) {
            setTracks(results);
          } else {
            // Add additional delay before showing "no results" message
            await new Promise(resolve => setTimeout(resolve, 500));
            toast({
              variant: "default",
              title: "Oops! Nothing here",
              description: `Try our Suggested Tracks `,
            });
            // Clear search and fetch new suggested tracks
            setSearchQuery("");
            fetchInitialTracks();
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Add delay before showing error message
        await new Promise(resolve => setTimeout(resolve, 500));
        setError(`Search failed: ${errorMessage}. Please try again.`);
        setTracks([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (currentQuery.trim()) {
      doSearch();
    } else {
      fetchInitialTracks();
    }

    return () => {
      mounted = false;
    };
  }, [currentQuery]);

  const shuffleTracks = async () => {
    try {
      setLoading(true);
      setError(null);

      // If shuffle pool is empty or we've gone through all tracks, refetch
      if (shufflePoolRef.current.length === 0 || shuffleIndexRef.current >= shufflePoolRef.current.length) {
        const response = await fetch(SEARCH_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer masterKey',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: '',
            limit: 1000, // Fetch a large number of tracks
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tracks for shuffle');
        }

        const data = await response.json();
        
        // Fisher-Yates shuffle
        const shuffled = [...data.hits];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        shufflePoolRef.current = shuffled;
        shuffleIndexRef.current = 0;
      }

      // Select 3 tracks from the pool, starting from the current index
      const selectedTracks = shufflePoolRef.current
        .slice(shuffleIndexRef.current, shuffleIndexRef.current + 3)
        .map((hit: SearchResponse['hits'][0]) => ({
          id: hit.id.toString(),
          slug: hit.slug,
          title: hit.title,
          artist: hit.author,
          albumArt: hit.image,
          bpm: hit.bpm,
          mood: (hit.happy ?? 0) > (hit.sad ?? 0) ? 'happy' : 'sad',
          key: [hit.key, hit.scale].filter(Boolean).join(' '),
          genre: Array.isArray(hit.genre) ? hit.genre.join(', ') : hit.genre,
          audioUrl: hit.path,
          energy: hit.energy,
          danceability: hit.danceability,
          duration: 0,
          cached: false,
          related_songs: [],
        }));

      // Update index for next shuffle
      shuffleIndexRef.current += 3;

      setTracks(selectedTracks);
    } catch (error) {
      console.error('Error shuffling tracks:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Failed to shuffle tracks: ${errorMessage}`);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTracks = async (selectedTrack: Track) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedTrack.related_songs?.length) {
        setError(`No related tracks found for "${selectedTrack.title}"`);
        return;
      }
      
      const relatedTracks = await getRelatedTracks(selectedTrack);
      
      if (relatedTracks.length === 0) {
        setError(`No related tracks could be loaded for "${selectedTrack.title}"`);
      }
      
      setTracks(relatedTracks);
    } catch (error) {
      console.error('Error fetching related tracks:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Failed to load related tracks: ${errorMessage}`);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  return { 
    tracks, 
    loading, 
    error,
    fetchRelatedTracks, 
    shuffleTracks 
  };
}