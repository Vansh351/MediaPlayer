import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MediaItem } from "../types";
import { mediaService } from "../services/MediaService";
import { usePlayer } from "../hooks/usePlayer";

export const LibraryScreen: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { playTrack } = usePlayer();

  useEffect(() => {
    loadMediaItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, mediaItems]);

  const loadMediaItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const items = await mediaService.getMediaItems();
      setMediaItems(items);
    } catch (error) {
      // console.error("Failed to load media items:", error);
      Alert.alert("Error", "Failed to load media library");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadMediaItems(true);
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(mediaItems);
      return;
    }

    const filtered = mediaItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.artist &&
          item.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.album &&
          item.album.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredItems(filtered);
  };

  const handlePlayItem = async (item: MediaItem) => {
    try {
      await playTrack(item);
    } catch (error) {
      Alert.alert("Error", "Failed to play track");
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    const isSelected = selectedItems.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.mediaItem, isSelected && styles.selectedItem]}
        onPress={() => handlePlayItem(item)}
        onLongPress={() => toggleItemSelection(item.id)}
      >
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.itemArtist} numberOfLines={1}>
            {item.artist || "Unknown Artist"}
          </Text>
          {item.album && (
            <Text style={styles.itemAlbum} numberOfLines={1}>
              {item.album}
            </Text>
          )}
        </View>

        <View style={styles.itemMeta}>
          <Text style={styles.itemDuration}>
            {formatDuration(item.duration)}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Music Library</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        {filteredItems.length} {filteredItems.length === 1 ? "track" : "tracks"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading media library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Media List */}
      <FlatList
        data={filteredItems}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      />

      {/* Selection Actions */}
      {selectedItems.size > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedItems.size} {selectedItems.size === 1 ? "item" : "items"}{" "}
            selected
          </Text>
          <TouchableOpacity style={styles.selectionButton}>
            <Text style={styles.selectionButtonText}>Add to Playlist</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#8E8E93",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#000000",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  refreshButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
  },
  listContainer: {
    paddingBottom: 100, // Space for player controls
  },
  mediaItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  selectedItem: {
    backgroundColor: "#E3F2FD",
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  itemArtist: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 2,
  },
  itemAlbum: {
    fontSize: 12,
    color: "#C7C7CC",
  },
  itemMeta: {
    alignItems: "flex-end",
  },
  itemDuration: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#007AFF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  selectionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  selectionButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectionButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
