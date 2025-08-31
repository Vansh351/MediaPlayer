export interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  uri: string;
  artwork?: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
  albumId?: string;
  artistId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: MediaItem[];
  createdAt: Date;
  updatedAt: Date;
  isSmart?: boolean;
  criteria?: PlaylistCriteria;
}

export interface PlaylistCriteria {
  genre?: string;
  artist?: string;
  year?: number;
  minDuration?: number;
  maxDuration?: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: MediaItem | null;
  currentPlaylist: Playlist | null;
  currentIndex: number;
  position: number;
  duration: number;
  volume: number;
  playbackRate: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  queue: MediaItem[];
}

export interface AudioSession {
  isActive: boolean;
  category: string;
  mode: string;
  allowsBluetooth: boolean;
  allowsBluetoothA2DP: boolean;
  allowsAirPlay: boolean;
  allowsRecording: boolean;
  allowsHFP: boolean;
}

export interface BackgroundAudioConfig {
  allowsBackgroundPlayback: boolean;
  allowsBackgroundPlaybackWhenLocked: boolean;
  allowsBackgroundPlaybackWhenMuted: boolean;
  allowsBackgroundPlaybackWhenInUse: boolean;
}

export type RepeatMode = 'off' | 'one' | 'all';
export type PlaybackRate = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface MediaLibraryStats {
  totalSongs: number;
  totalAlbums: number;
  totalArtists: number;
  totalPlaylists: number;
  totalDuration: number;
}
