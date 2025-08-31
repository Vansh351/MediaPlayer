import { Audio } from 'expo-av';
import { MediaItem, PlayerState, RepeatMode, PlaybackRate } from '../types';

class AudioPlayerService {
  private sound: Audio.Sound | null = null;
  private playerState: PlayerState = {
    isPlaying: false,
    currentTrack: null,
    currentPlaylist: null,
    currentIndex: 0,
    position: 0,
    duration: 0,
    volume: 1.0,
    playbackRate: 1.0,
    shuffle: false,
    repeat: 'off',
    queue: [],
  };

  private listeners: ((state: PlayerState) => void)[] = [];
  private positionUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupAudioSession();
  }

  private async setupAudioSession(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to setup audio session:', error);
    }
  }

  async loadTrack(mediaItem: MediaItem): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: mediaItem.uri },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.playerState.currentTrack = mediaItem;
      this.playerState.duration = mediaItem.duration;
      this.playerState.position = 0;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load track:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        this.playerState.isPlaying = true;
        this.startPositionUpdates();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to play:', error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        this.playerState.isPlaying = false;
        this.stopPositionUpdates();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to pause:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.setPositionAsync(0);
        this.playerState.isPlaying = false;
        this.playerState.position = 0;
        this.stopPositionUpdates();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to stop:', error);
      throw error;
    }
  }

  async seekTo(position: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(position * 1000);
        this.playerState.position = position;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to seek:', error);
      throw error;
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(volume);
        this.playerState.volume = volume;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw error;
    }
  }

  async setPlaybackRate(rate: PlaybackRate): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setRateAsync(rate, true);
        this.playerState.playbackRate = rate;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to set playback rate:', error);
      throw error;
    }
  }

  async skipToNext(): Promise<void> {
    if (this.playerState.queue.length === 0) return;

    let nextIndex = this.playerState.currentIndex + 1;
    
    if (nextIndex >= this.playerState.queue.length) {
      if (this.playerState.repeat === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    await this.playTrackAtIndex(nextIndex);
  }

  async skipToPrevious(): Promise<void> {
    if (this.playerState.queue.length === 0) return;

    let prevIndex = this.playerState.currentIndex - 1;
    
    if (prevIndex < 0) {
      if (this.playerState.repeat === 'all') {
        prevIndex = this.playerState.queue.length - 1;
      } else {
        return;
      }
    }

    await this.playTrackAtIndex(prevIndex);
  }

  async playPlaylist(playlist: any, startIndex: number = 0): Promise<void> {
    this.playerState.currentPlaylist = playlist;
    this.playerState.queue = [...playlist.tracks];
    this.playerState.currentIndex = startIndex;
    
    if (this.playerState.shuffle) {
      this.shuffleQueue();
    }

    await this.playTrackAtIndex(startIndex);
  }

  async playTrackAtIndex(index: number): Promise<void> {
    if (index < 0 || index >= this.playerState.queue.length) return;

    const track = this.playerState.queue[index];
    this.playerState.currentIndex = index;
    
    await this.loadTrack(track);
    await this.play();
  }

  setShuffle(enabled: boolean): void {
    this.playerState.shuffle = enabled;
    if (enabled && this.playerState.queue.length > 0) {
      this.shuffleQueue();
    }
    this.notifyListeners();
  }

  setRepeat(mode: RepeatMode): void {
    this.playerState.repeat = mode;
    this.notifyListeners();
  }

  private shuffleQueue(): void {
    const currentTrack = this.playerState.queue[this.playerState.currentIndex];
    const otherTracks = this.playerState.queue.filter((_, index) => index !== this.playerState.currentIndex);
    
    // Fisher-Yates shuffle
    for (let i = otherTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
    }
    
    this.playerState.queue = [currentTrack, ...otherTracks];
    this.playerState.currentIndex = 0;
  }

  private onPlaybackStatusUpdate(status: any): void {
    if (status.isLoaded) {
      this.playerState.position = status.positionMillis / 1000; // Convert to seconds
      this.playerState.duration = status.durationMillis / 1000;
      this.playerState.isPlaying = status.isPlaying;
      
      if (status.didJustFinish) {
        this.handleTrackEnd();
      }
      
      this.notifyListeners();
    }
  }

  private async handleTrackEnd(): Promise<void> {
    if (this.playerState.repeat === 'one') {
      await this.seekTo(0);
      await this.play();
    } else {
      await this.skipToNext();
    }
  }

  private startPositionUpdates(): void {
    this.stopPositionUpdates();
    this.positionUpdateInterval = setInterval(() => {
      if (this.sound && this.playerState.isPlaying) {
        this.sound.getStatusAsync().then(status => {
          if (status.isLoaded) {
            this.playerState.position = status.positionMillis / 1000;
            this.notifyListeners();
          }
        });
      }
    }, 1000);
  }

  private stopPositionUpdates(): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
      this.positionUpdateInterval = null;
    }
  }

  getPlayerState(): PlayerState {
    return { ...this.playerState };
  }

  addListener(listener: (state: PlayerState) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (state: PlayerState) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getPlayerState()));
  }

  async cleanup(): Promise<void> {
    this.stopPositionUpdates();
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this.listeners = [];
  }
}

export const audioPlayerService = new AudioPlayerService();
