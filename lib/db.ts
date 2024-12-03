import Dexie, { type Table } from 'dexie';

export interface Track {
  id: string;
  slug: string;
  title: string;
  artist: string;
  albumArt: string;
  bpm: number;
  mood: string;
  key: string;
  genre: string;
  energy: number;
  audioUrl: string;
  duration: number;
  cached: boolean;
  related_songs?: string[];
}

export interface PlaybackState {
  id: string;
  position: number;
  timestamp: number;
}

export class MusicDatabase extends Dexie {
  tracks!: Table<Track>;
  playbackStates!: Table<PlaybackState>;

  constructor() {
    super('MusicDatabase');
    this.version(1).stores({
      tracks: 'id, slug, cached',
      playbackStates: 'id',
    });
  }
}

export const db = new MusicDatabase();