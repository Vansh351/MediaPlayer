import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { MediaItem, Playlist, MediaLibraryStats } from '../types';
import { SampleAudioService } from './SampleAudioService';
import uuid from 'react-native-uuid';

class MediaService {
  private mediaItems: MediaItem[] = [];
  private playlists: Playlist[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      // console.log('Initializing media service...');
      
      // Request permissions with specific audio context
      const { status } = await MediaLibrary.requestPermissionsAsync();
      // console.log('Initial permission request status:', status);
      
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }
      
      // console.log('Permission granted, scanning for audio files...');
      await this.scanMediaLibrary();
      await this.loadPlaylists();
      this.isInitialized = true;
      // console.log('Media service initialized successfully');
    } catch (error) {
      // console.error('Failed to initialize media service:', error);
      throw error;
    }
  }

  async scanMediaLibrary(): Promise<MediaItem[]> {
    try {
      
      // First check permissions
      const { status } = await MediaLibrary.getPermissionsAsync();
      // console.log('Media library permission status:', status);
      
      if (status !== 'granted') {
        // console.log('Requesting media library permissions...');
        const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
        // console.log('New permission status:', newStatus);
        
        if (newStatus !== 'granted') {
          // Provide sample tracks if permission denied
          this.mediaItems = SampleAudioService.getSampleTracks();
          return this.mediaItems;
        }
      }
      
      // First try to get audio assets specifically
      let media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      // console.log('Found', media.assets.length, 'audio assets');

      // If no audio assets found, try a broader search but filter for audio files
      if (media.assets.length === 0) {
        // console.log('No audio assets found, trying broader search...');
        const allMedia = await MediaLibrary.getAssetsAsync({
          first: 2000,
          sortBy: MediaLibrary.SortBy.creationTime,
        });
        
        // Filter for audio files by extension
        const audioExtensions = ['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg', '.wma'];
        const audioAssets = allMedia.assets.filter(asset => {
          const filename = asset.filename.toLowerCase();
          return audioExtensions.some(ext => filename.endsWith(ext));
        });
        
        media = { 
          assets: audioAssets,
          endCursor: allMedia.endCursor,
          hasNextPage: allMedia.hasNextPage,
          totalCount: allMedia.totalCount
        };
      }

      if (media.assets.length === 0) {
        // No audio assets found, providing sample tracks
        this.mediaItems = SampleAudioService.getSampleTracks();
        return this.mediaItems;
      }

      this.mediaItems = await Promise.all(
        media.assets.map(async (asset, index) => {          
          const mediaItem: MediaItem = {
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ''),
            duration: asset.duration || 0,
            uri: asset.uri,
            artwork: asset.albumId ? `asset://${asset.albumId}` : undefined,
          };

          if (asset.albumId) {
            try {
              const album = await MediaLibrary.getAlbumAsync(asset.albumId);
              if (album) {
                mediaItem.album = album.title;
                mediaItem.albumId = album.id;
              }
            } catch (albumError) {
              // console.log('Could not fetch album info for asset:', asset.id);
            }
          }

          return mediaItem;
        })
      );

      return this.mediaItems;
    } catch (error) {
      // console.error('Failed to scan media library:', error);
      // If no media found, provide sample tracks for testing
      if (this.mediaItems.length === 0) {
        this.mediaItems = SampleAudioService.getSampleTracks();
      }
      return this.mediaItems;
    }
  }

  async getMediaItems(): Promise<MediaItem[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.mediaItems;
  }

  async getAlbums(): Promise<{ [key: string]: MediaItem[] }> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const albums: { [key: string]: MediaItem[] } = {};
    this.mediaItems.forEach(item => {
      const albumKey = item.album || 'Unknown Album';
      if (!albums[albumKey]) {
        albums[albumKey] = [];
      }
      albums[albumKey].push(item);
    });
    
    return albums;
  }

  async getArtists(): Promise<{ [key: string]: MediaItem[] }> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const artists: { [key: string]: MediaItem[] } = {};
    this.mediaItems.forEach(item => {
      const artistKey = item.artist || 'Unknown Artist';
      if (!artists[artistKey]) {
        artists[artistKey] = [];
      }
      artists[artistKey].push(item);
    });
    
    return artists;
  }

  async createPlaylist(name: string, description?: string): Promise<Playlist> {
    const playlist: Playlist = {
      id: uuid.v4(),
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.playlists.push(playlist);
    await this.savePlaylists();
    return playlist;
  }

  async addToPlaylist(playlistId: string, mediaItem: MediaItem): Promise<void> {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    if (!playlist.tracks.find(track => track.id === mediaItem.id)) {
      playlist.tracks.push(mediaItem);
      playlist.updatedAt = new Date();
      await this.savePlaylists();
    }
  }

  async removeFromPlaylist(playlistId: string, mediaItemId: string): Promise<void> {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    playlist.tracks = playlist.tracks.filter(track => track.id !== mediaItemId);
    playlist.updatedAt = new Date();
    await this.savePlaylists();
  }

  async getPlaylists(): Promise<Playlist[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return [...this.playlists];;
  }

  async getPlaylistById(id: string): Promise<Playlist | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.playlists.find(playlist => playlist.id === id) || null;
  }

  async deletePlaylist(id: string): Promise<void> {
    this.playlists = this.playlists.filter(playlist => playlist.id !== id);
    await this.savePlaylists();
  }

  private async loadPlaylists(): Promise<void> {
    try {
      const playlistsPath = `${FileSystem.documentDirectory}playlists.json`;
      const playlistsData = await FileSystem.readAsStringAsync(playlistsPath);
      this.playlists = JSON.parse(playlistsData).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch (error) {
      // File doesn't exist or is invalid, start with empty playlists
      this.playlists = [];
    }
  }

  private async savePlaylists(): Promise<void> {
    try {
      const playlistsPath = `${FileSystem.documentDirectory}playlists.json`;
      await FileSystem.writeAsStringAsync(playlistsPath, JSON.stringify(this.playlists));
    } catch (error) {
      // console.error('Failed to save playlists:', error);
      throw error;
    }
  }
}

export const mediaService = new MediaService();
