import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Playlist } from '../types';
import { mediaService } from '../services/MediaService';
import { usePlayer } from '../hooks/usePlayer';

type naviagtionProps = {
	navigation: any;
	route: any;
}

export const PlaylistsScreen: React.FC<naviagtionProps> = ({ navigation }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const { playPlaylist } = usePlayer();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const playlistsData = await mediaService.getPlaylists();
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      const newPlaylist = await mediaService.createPlaylist(
        newPlaylistName.trim(),
        newPlaylistDescription.trim() || undefined
      );
      setPlaylists([...playlists, newPlaylist]);
      setShowCreateModal(false);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
			navigation.navigate('PlaylistDetail', { playlistId: newPlaylist?.id });
    } catch (error) {
      console.error('Failed to create playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    try {
			console.log("🚀 ~ handlePlayPlaylist ~ handlePlayPlaylist:")
			navigation.navigate('PlaylistDetail', { playlistId: playlist?.id });
    } catch (error) {
      console.error('Failed to play playlist:', error);
      Alert.alert('Error', 'Failed to play playlist');
    }
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mediaService.deletePlaylist(playlist.id);
              setPlaylists(playlists.filter(p => p.id !== playlist.id));
            } catch (error) {
              console.error('Failed to delete playlist:', error);
              Alert.alert('Error', 'Failed to delete playlist');
            }
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlaylistDuration = (playlist: Playlist): number => {
    return playlist.tracks.reduce((total, track) => total + track.duration, 0);
  };

  const renderPlaylist = ({ item }: { item: Playlist }) => {
    const duration = getPlaylistDuration(item);

    return (
      <TouchableOpacity
        style={styles.playlistItem}
        onPress={() => handlePlayPlaylist(item)}
      >
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.playlistDetails}>
            {item.tracks.length} {item.tracks.length === 1 ? 'track' : 'tracks'} • {formatDuration(duration)}
          </Text>
          {item.description && (
            <Text style={styles.playlistDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        
        <View style={styles.playlistActions}>
          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handlePlayPlaylist(item);
            }}
          >
            <Ionicons name="play" size={20} color="#007AFF" />
          </TouchableOpacity> */}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeletePlaylist(item);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
	
	const openModal = () => {
		console.log('Opening create playlist modal...');
		setShowCreateModal(true);
	}

  const renderHeader = () => (
    <View style={styles.header}>
			<View>
				<Text style={styles.title}>Playlists</Text>
				<Text style={styles.subtitle}>
					{playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
				</Text>
			</View>
			<View>
			<TouchableOpacity
				style={styles.createButton}
				onPress={openModal}
			>
				<Ionicons name="add" size={24} color="#FFFFFF" />
			</TouchableOpacity>
			</View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading playlists...</Text>
      </View>
    );
  }

  return (
		<>
		<View style={styles.container}>
      <FlatList
        data={playlists}
        renderItem={renderPlaylist}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
		<Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
				style={{ maxHeight: 60}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TouchableOpacity onPress={handleCreatePlaylist}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newPlaylistDescription}
              onChangeText={setNewPlaylistDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </Modal>
		</>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 5,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
		borderTopWidth: 1
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  listContainer: {
    paddingBottom: 100,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  playlistInfo: {
    flex: 1,
    marginRight: 12,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  playlistDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  playlistDescription: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  playlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalContent: {
    padding: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
