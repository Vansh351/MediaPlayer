import { useState, useEffect } from 'react';
import { PlayerState, MediaItem, Playlist, RepeatMode, PlaybackRate } from '../types';
import { audioPlayerService } from '../services/AudioPlayerService';

export const usePlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(audioPlayerService.getPlayerState());

  useEffect(() => {
    const listener = (state: PlayerState) => {
      setPlayerState(state);
    };

    audioPlayerService.addListener(listener);
    return () => audioPlayerService.removeListener(listener);
  }, []);

  const play = async () => {
    try {
      await audioPlayerService.play();
    } catch (error) {
      console.error('Failed to play:', error);
    }
  };

  const pause = async () => {
    try {
      await audioPlayerService.pause();
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  };

  const stop = async () => {
    try {
      await audioPlayerService.stop();
    } catch (error) {
      console.error('Failed to stop:', error);
    }
  };

  const seekTo = async (position: number) => {
    try {
      await audioPlayerService.seekTo(position);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const setVolume = async (volume: number) => {
    try {
      await audioPlayerService.setVolume(volume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  const setPlaybackRate = async (rate: PlaybackRate) => {
    try {
      await audioPlayerService.setPlaybackRate(rate);
    } catch (error) {
      console.error('Failed to set playback rate:', error);
    }
  };

  const skipToNext = async () => {
    try {
      await audioPlayerService.skipToNext();
    } catch (error) {
      console.error('Failed to skip to next:', error);
    }
  };

  const skipToPrevious = async () => {
    try {
      await audioPlayerService.skipToPrevious();
    } catch (error) {
      console.error('Failed to skip to previous:', error);
    }
  };

  const playTrack = async (mediaItem: MediaItem) => {
    try {
      await audioPlayerService.loadTrack(mediaItem);
      await audioPlayerService.play();
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const playPlaylist = async (playlist: Playlist, startIndex: number = 0) => {
    try {
      await audioPlayerService.playPlaylist(playlist, startIndex);
    } catch (error) {
      console.error('Failed to play playlist:', error);
    }
  };

  const setShuffle = (enabled: boolean) => {
    audioPlayerService.setShuffle(enabled);
  };

  const setRepeat = (mode: RepeatMode) => {
    audioPlayerService.setRepeat(mode);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    playerState,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    setPlaybackRate,
    skipToNext,
    skipToPrevious,
    playTrack,
    playPlaylist,
    setShuffle,
    setRepeat,
    formatTime,
  };
};
