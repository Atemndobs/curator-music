import { Track } from './db';
import { Howl } from 'howler';

export const SEARCH_API_URL = 'https://search.curator.atemkeng.eu/indexes/songs/search';

export interface SearchFilters {
  bpm?: number;
  bpmRange?: string;
  mood?: string;
  key?: string;
  genre?: string | string[];
  energy?: number;
}

export interface SearchResponse {
  hits: Array<{
    id: number;
    title: string;
    author: string;
    bpm: number;
    key: string;
    scale: string;
    energy: number;
    happy: number;
    sad: number;
    analyzed: number;
    aggressiveness: number;
    danceability: number;
    relaxed: number;
    played: number;
    path: string;
    slug: string;
    image: string;
    related_songs: string;
    genre: string | string[];
    song_id: null | number;
    comment: string;
    status: string;
    classification_properties: string;
  }>;
}

function getDuration(audioUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const sound = new Howl({
      src: [audioUrl],
      html5: true,
      onload: function() {
        resolve(sound.duration());
      },
      onloaderror: () => {
        console.warn(`Could not load audio for duration: ${audioUrl}`);
        resolve(0);
      }
    });
  });
}

function transformSearchHit(hit: SearchResponse['hits'][0]): Promise<Track> {
  if (!hit) {
    throw new Error('Invalid hit object');
  }

  const genres = (() => {
    if (Array.isArray(hit.genre)) {
      return hit.genre;
    }
    if (hit.genre && typeof hit.genre === 'string') {
      return hit.genre.split(',').map(g => g.trim()).filter(Boolean);
    }
    return [];
  })();
  const mood = (hit.happy ?? 0) > (hit.sad ?? 0) ? 'happy' : 'sad';
  const keyScale = [hit.key, hit.scale].filter(Boolean).join(' ') || 'Unknown';

  return getDuration(hit.path || '').then(duration => ({
    id: hit.id ? String(hit.id) : '',
    slug: hit.slug || '',
    title: hit.title || 'Untitled',
    artist: hit.author || 'Unknown Artist',
    albumArt: hit.image || '/images/default-album-art.png',
    bpm: hit.bpm || 0,
    mood,
    key: keyScale,
    genre: genres.length > 0 ? genres.join(', ') : 'Unknown',
    energy: hit.energy || 0,
    audioUrl: hit.path || '',
    duration,
    cached: false,
  }));
}

export async function getRelatedTracks(track: Track): Promise<Track[]> {
  try {
    if (!track.related_songs || track.related_songs.length === 0) {
      console.warn('No related songs found for track:', track.title);
      return [];
    }

    // Fetch all related songs in parallel
    const relatedTracksPromises = track.related_songs.map(async (url) => {
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer masterKey',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch related track:', url);
        return null;
      }

      const data = await response.json();
      return transformSearchHit(data);
    });

    const relatedTracks = await Promise.all(relatedTracksPromises);
    return relatedTracks.filter((track): track is Track => track !== null);
  } catch (error) {
    console.error('Error fetching related tracks:', error);
    return [];
  }
}

export async function searchTracks(query: string, filters?: SearchFilters): Promise<Track[]> {
  try {
    // First try strict search
    const strictResponse = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer masterKey',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query || '',
        limit: 20,
        matchingStrategy: 'all', // Require all terms to match
      }),
    });

    if (!strictResponse.ok) {
      const errorText = await strictResponse.text();
      console.error('Strict search failed:', strictResponse.status, errorText);
      return [];
    }

    const strictData: SearchResponse = await strictResponse.json();
    
    // If strict search found results, return them
    if (strictData?.hits?.length > 0) {
      return Promise.all(strictData.hits.map(hit => transformSearchHit(hit)));
    }

    // If no strict matches, try fuzzy search with more tolerance
    const fuzzyResponse = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer masterKey',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query || '',
        limit: 20,
        matchingStrategy: 'frequency', // Use frequency-based matching for better fuzzy results
        showMatchesPosition: true,     // Show where matches occur
        rankingScoreThreshold: 0.3,    // Lower threshold for matches
      }),
    });

    if (!fuzzyResponse.ok) {
      const errorText = await fuzzyResponse.text();
      console.error('Fuzzy search failed:', fuzzyResponse.status, errorText);
      return [];
    }

    const fuzzyData: SearchResponse = await fuzzyResponse.json();
    
    if (!fuzzyData || !Array.isArray(fuzzyData.hits)) {
      console.error('Invalid search response:', fuzzyData);
      return [];
    }

    return Promise.all(fuzzyData.hits.map(hit => transformSearchHit(hit)));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}

export async function setFilters(filters: SearchFilters): Promise<void> {
  try {
    const response = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer masterKey',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to set filters');
    }
  } catch (error) {
    console.error('Error setting filters:', error);
  }
}