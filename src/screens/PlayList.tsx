import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Playlist, MediaItem } from "../types";
import { mediaService } from "../services/MediaService";
import { usePlayer } from "../hooks/usePlayer";

export const PlaylistDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { playPlaylist } = usePlayer();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  const [addTracksModalVisible, setAddTracksModalVisible] = useState(false);
  const [allLibraryTracks, setAllLibraryTracks] = useState<MediaItem[]>([]);
  const [selectedModalTracks, setSelectedModalTracks] = useState<Set<string>>(
    new Set()
  );

  const { playlistId } = route.params as { playlistId: string };

  const refreshPlaylist = async () => {
    try {
      if (!playlist) {
        setLoading(true);
      }
      const fetchedPlaylist = await mediaService.getPlaylistById(playlistId);
      if (fetchedPlaylist) {
        setPlaylist(fetchedPlaylist);
        navigation.setOptions({ title: fetchedPlaylist.name });
      } else {
        Alert.alert("Error", "Playlist not found.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load playlist details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPlaylist();
  }, [playlistId]);

  const openAddTracksModal = async () => {
    if (!playlist) return;
    const libraryTracks = await mediaService.getMediaItems();
    const existingTrackIds = new Set(playlist.tracks.map((t) => t.id));
    const availableTracks = libraryTracks.filter(
      (t) => !existingTrackIds.has(t.id)
    );
    setAllLibraryTracks(availableTracks);
    setAddTracksModalVisible(true);
  };

  const toggleModalTrackSelection = (trackId: string) => {
    const newSelection = new Set(selectedModalTracks);
    if (newSelection.has(trackId)) {
      newSelection.delete(trackId);
    } else {
      newSelection.add(trackId);
    }
    setSelectedModalTracks(newSelection);
  };

  const handleAddSelectedTracks = async () => {
    if (!playlist || selectedModalTracks.size === 0) {
      setAddTracksModalVisible(false);
      return;
    }
    const tracksToAdd = allLibraryTracks.filter((t) =>
      selectedModalTracks.has(t.id)
    );
    try {
      await Promise.all(
        tracksToAdd.map((track) =>
          mediaService.addToPlaylist(playlist.id, track)
        )
      );

      await refreshPlaylist();

      Alert.alert(
        "Success",
        `${tracksToAdd.length} ${
          tracksToAdd.length === 1 ? "song" : "songs"
        } added.`
      );
    } catch (error) {
      //console.error("Failed to add selected tracks:", error);
      Alert.alert("Error", "Could not add songs.");
    } finally {
      setAddTracksModalVisible(false);
      setSelectedModalTracks(new Set());
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    if (!playlist) return;
    const trackToRemove = playlist.tracks.find((t) => t.id === trackId);
    if (!trackToRemove) return;
    Alert.alert(
      "Remove Track",
      `Are you sure you want to remove "${trackToRemove.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const originalPlaylist = playlist;

            setPlaylist((p) =>
              p
                ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
                : null
            );

            try {
              await mediaService.removeFromPlaylist(
                originalPlaylist.id,
                trackId
              );
            } catch (error) {
              Alert.alert("Error", "Failed to remove track.");
              setPlaylist(originalPlaylist);
            }
          },
        },
      ]
    );
  };

  const handlePlayTrack = (track: MediaItem) => {
    if (playlist) {
      const trackIndex = playlist.tracks.findIndex((t) => t.id === track.id);
      playPlaylist(playlist, trackIndex);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      playPlaylist(playlist, 0);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    let timeString = `${mins}:${secs.toString().padStart(2, "0")}`;
    if (hours > 0) {
      timeString = `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return timeString;
  };

  const totalDuration = useMemo(() => {
    if (!playlist) return 0;
    return playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
  }, [playlist]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.playlistTitle} numberOfLines={1}>
          {playlist?.name}
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={openAddTracksModal}
        >
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.playlistMeta}>
        {playlist?.tracks.length}{" "}
        {playlist?.tracks.length === 1 ? "song" : "songs"},{" "}
        {formatDuration(totalDuration)}
      </Text>
      <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
        <Ionicons name="play" size={20} color="#FFFFFF" />
        <Text style={styles.playAllButtonText}>Play All</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTrackItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handlePlayTrack(item)}
    >
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist || "Unknown Artist"}
        </Text>
      </View>
      <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={(e) => {
          e.stopPropagation();
          handleRemoveTrack(item.id);
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <FlatList
        data={playlist?.tracks || []}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>This playlist is empty.</Text>
            <Text style={styles.emptySubText}>
              Add songs from your library.
            </Text>
          </View>
        }
      />

      <Modal
        visible={addTracksModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddTracksModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setAddTracksModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Songs</Text>
            <TouchableOpacity onPress={handleAddSelectedTracks}>
              <Text style={[styles.modalButtonText, { fontWeight: "600" }]}>
                Add ({selectedModalTracks.size})
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={allLibraryTracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedModalTracks.has(item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.modalTrackItem,
                    isSelected && styles.modalTrackItemSelected,
                  ]}
                  onPress={() => toggleModalTrackSelection(item.id)}
                >
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{item.title}</Text>
                    <Text style={styles.trackArtist}>
                      {item.artist || "Unknown Artist"}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#007AFF"
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  headerButton: { padding: 4, width: 36, alignItems: "center" },
  playlistTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  playlistMeta: { fontSize: 16, color: "#8A8A8E", marginBottom: 20 },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  playAllButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  trackInfo: { flex: 1, marginRight: 8 },
  trackTitle: { fontSize: 16, fontWeight: "500" },
  trackArtist: { fontSize: 14, color: "#8A8A8E", marginTop: 2 },
  trackDuration: { fontSize: 14, color: "#8A8A8E", marginHorizontal: 16 },
  removeButton: { padding: 8 },
  emptyContainer: {
    flex: 1,
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#8A8A8E" },
  emptySubText: { fontSize: 14, color: "#C7C7CC", marginTop: 8 },
  modalContainer: { flex: 1, backgroundColor: "#F2F2F7" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: { fontSize: 17, fontWeight: "600" },
  modalButtonText: { fontSize: 17, color: "#007AFF" },
  modalTrackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTrackItemSelected: { backgroundColor: "#E9F5FF" },
});
