import { MediaItem } from '../types';

// Sample audio files for testing
export const sampleAudioFiles: MediaItem[] = [
  {
    id: 'sample-1',
    title: 'Sample Track 1',
    artist: 'Test Artist',
    album: 'Test Album',
    duration: 180, // 3 minutes
    uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    genre: 'Test',
    year: 2024,
  },
  {
    id: 'sample-2',
    title: 'Sample Track 2',
    artist: 'Test Artist',
    album: 'Test Album',
    duration: 240, // 4 minutes
    uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    genre: 'Test',
    year: 2024,
  },
  {
    id: 'sample-3',
    title: 'Sample Track 3',
    artist: 'Another Artist',
    album: 'Another Album',
    duration: 200, // 3:20 minutes
    uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    genre: 'Test',
    year: 2024,
  },
];

export class SampleAudioService {
  static getSampleTracks(): MediaItem[] {
    return sampleAudioFiles;
  }

  static getSamplePlaylist() {
    return {
      id: 'sample-playlist',
      name: 'Sample Playlist',
      description: 'A sample playlist for testing',
      tracks: sampleAudioFiles,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
