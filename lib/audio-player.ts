import { Howl } from 'howler';
import { db, Track } from './db';

class AudioPlayer {
  private _sound: Howl | null = null;
  private currentTrack: Track | null = null;
  private listeners: Set<(state: AudioPlayerState) => void> = new Set();

  async play(track: Track): Promise<void> {
    if (this._sound) {
      this._sound.unload();
    }

    this.currentTrack = track;
    
    // Try to load from IndexedDB first
    let audioUrl = track.audioUrl;
    const cachedTrack = await db.tracks.get(track.id);
    if (cachedTrack?.cached) {
      audioUrl = `indexeddb://${track.id}`;
    }

    // Check if audio URL is accessible
    try {
      const response = await fetch(audioUrl, { method: 'HEAD' });
      console.log(`Audio URL: ${audioUrl}, Status: ${response.status}`);
      if (!response.ok) {
        console.error('Failed to load audio:', response.statusText);
        return;
      }
    } catch (error) {
      console.error('Error fetching audio URL:', error);
      return;
    }

    this._sound = new Howl({
      src: [audioUrl],
      html5: true,
      onplay: () => this.notifyListeners(),
      onpause: () => this.notifyListeners(),
      onstop: () => this.notifyListeners(),
      onend: () => this.notifyListeners(),
      onseek: () => this.notifyListeners(),
    });

    await this._sound.play();
  }

  pause(): void {
    this._sound?.pause();
  }

  resume(): void {
    this._sound?.play();
  }

  seek(position: number): void {
    this._sound?.seek(position);
  }

  getCurrentState(): AudioPlayerState {
    if (!this._sound || !this.currentTrack) {
      return { playing: false };
    }

    return {
      playing: this._sound.playing(),
      position: this._sound.seek() as number,
      duration: this._sound.duration(),
      track: this.currentTrack,
    };
  }

  subscribe(callback: (state: AudioPlayerState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const state = this.getCurrentState();
    this.listeners.forEach(listener => listener(state));
  }

  // Expose sound for external volume control
  get sound(): Howl | null {
    return this._sound;
  }
}

export interface AudioPlayerState {
  playing: boolean;
  position?: number;
  duration?: number;
  track?: Track;
}

export const audioPlayer = new AudioPlayer();