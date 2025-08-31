import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../hooks/usePlayer';
import { PlaybackRate } from '../types';

const { width, height } = Dimensions.get('window');

export const NowPlayingScreen: React.FC = () => {
  const {
    playerState,
    play,
    pause,
    seekTo,
    skipToNext,
    skipToPrevious,
    setShuffle,
    setRepeat,
    setPlaybackRate,
    formatTime,
  } = usePlayer();

  const { currentTrack, isPlaying, position, duration, shuffle, repeat, playbackRate } = playerState;

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (value: number) => {
    seekTo(value);
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const cycleRepeatMode = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex] as any);
  };

  const cyclePlaybackRate = () => {
    const rates: PlaybackRate[] = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate as PlaybackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const getRepeatIcon = () => {
    switch (repeat) {
      case 'off':
        return 'repeat-outline';
      case 'all':
        return 'repeat';
      case 'one':
        return 'repeat-one';
      default:
        return 'repeat-outline';
    }
  };

  if (!currentTrack) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-notes-outline" size={80} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>No Track Playing</Text>
        <Text style={styles.emptySubtitle}>
          Select a track from your library to start listening
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
			<View style={styles.artworkContainer}>
        <View style={styles.artwork}>
          <Ionicons name="musical-notes" size={80} color="#007AFF" />
        </View>
      </View>


      <View style={styles.trackInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {currentTrack.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack.artist || 'Unknown Artist'}
        </Text>
        {currentTrack.album && (
          <Text style={styles.album} numberOfLines={1}>
            {currentTrack.album}
          </Text>
        )}
      </View>


      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(position / duration) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>


      <View style={styles.mainControls}>
        <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={32} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.secondaryControls}>
        <TouchableOpacity onPress={toggleShuffle} style={styles.secondaryButton}>
          <Ionicons
            name={shuffle ? 'shuffle' : 'shuffle-outline'}
            size={24}
            color={shuffle ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[
            styles.secondaryButtonText,
            { color: shuffle ? '#007AFF' : '#8E8E93' }
          ]}>
            Shuffle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={cycleRepeatMode} style={styles.secondaryButton}>
          <Ionicons
            name={getRepeatIcon() as any}
            size={24}
            color={repeat !== 'off' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[
            styles.secondaryButtonText,
            { color: repeat !== 'off' ? '#007AFF' : '#8E8E93' }
          ]}>
            {repeat === 'one' ? 'Repeat One' : 'Repeat'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={cyclePlaybackRate} style={styles.secondaryButton}>
          <Text style={[
            styles.secondaryButtonText,
            { color: playbackRate !== 1.0 ? '#007AFF' : '#8E8E93' }
          ]}>
            {playbackRate}x
          </Text>
        </TouchableOpacity>
      </View>


      <View style={styles.queueInfo}>
        <Text style={styles.queueTitle}>Queue</Text>
        <Text style={styles.queueSubtitle}>
          {playerState.queue.length} {playerState.queue.length === 1 ? 'track' : 'tracks'} in queue
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 22,
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  artwork: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 30,
  },
  artist: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 4,
  },
  album: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    backgroundColor: '#007AFF',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 10,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  queueInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  queueSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
