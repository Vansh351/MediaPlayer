import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../hooks/usePlayer';

export const PlayerControls: React.FC = () => {
  const {
    playerState,
    play,
    pause,
    skipToNext,
    skipToPrevious,
  } = usePlayer();

  const { currentTrack, isPlaying, position, duration } = playerState;

  if (!currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <View style={styles.content}>
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist || 'Unknown Artist'}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={24} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={36}
              color="#007AFF"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 65,
    width: '100%',
    backgroundColor: 'rgba(248, 248, 248, 0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
		position: 'absolute',
		bottom: 85,
		left: 0,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  trackInfo: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  artist: {
    fontSize: 12,
    color: '#666666',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    paddingHorizontal: 8,
  },
});
