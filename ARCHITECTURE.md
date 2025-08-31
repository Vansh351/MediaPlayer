# Media Player Architecture Documentation

## Overview

This document outlines the architecture and implementation details of the Advanced Media Player application built with React Native and Expo.

## Core Architecture

### 1. Service Layer

#### MediaService (`src/services/MediaService.ts`)
- **Purpose**: Handles media library scanning, metadata extraction, and playlist management
- **Key Features**:
  - Media library permission handling
  - Audio file scanning and indexing
  - Playlist CRUD operations
  - Metadata extraction and caching
  - File system persistence for playlists

#### AudioPlayerService (`src/services/AudioPlayerService.ts`)
- **Purpose**: Manages audio playback and player state
- **Key Features**:
  - Audio session configuration for background playback
  - Playback controls (play, pause, seek, etc.)
  - Queue management with shuffle and repeat
  - Background audio support
  - Volume and playback rate control

### 2. State Management

#### usePlayer Hook (`src/hooks/usePlayer.ts`)
- **Purpose**: React hook for player state management
- **Key Features**:
  - Player state synchronization
  - Error handling
  - Time formatting utilities
  - Event listener management

### 3. UI Components

#### PlayerControls (`src/components/PlayerControls.tsx`)
- **Purpose**: Main player interface with controls
- **Features**:
  - Play/pause, skip controls
  - Progress bar with seeking
  - Shuffle and repeat toggles
  - Playback rate control

#### LibraryScreen (`src/screens/LibraryScreen.tsx`)
- **Purpose**: Media library browser
- **Features**:
  - Search and filtering
  - Multi-select functionality
  - Track information display

#### Playlist (`src/screens/Playlist.tsx`)
- **Purpose**: Selected playlist details
- **Features**:
  - Add/delete tracks
  - Tracks details
  - Track management

#### PlaylistsListing (`src/screens/PlaylistsListing.tsx`)
- **Purpose**: Playlist management
- **Features**:
  - Create/edit/delete playlists
  - Playlist playback
  - Track management

#### NowPlayingScreen (`src/screens/NowPlayingScreen.tsx`)
- **Purpose**: Enhanced now playing interface
- **Features**:
  - Album artwork display
  - Detailed track information
  - Advanced controls

## System Integration

### Background Audio Implementation

```typescript
// Audio session configuration for background playback
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});
```

### Media Library Integration

```typescript
// Media library scanning with metadata extraction
const media = await MediaLibrary.getAssetsAsync({
  mediaType: MediaLibrary.MediaType.audio,
  first: 1000,
  sortBy: MediaLibrary.SortBy.creationTime,
});
```

### Playlist Persistence

```typescript
// File system-based playlist storage
const playlistsPath = `${FileSystem.documentDirectory}playlists.json`;
await FileSystem.writeAsStringAsync(playlistsPath, JSON.stringify(playlists));
```

## Data Flow

1. **App Initialization**:
   - Initialize media service
   - Request permissions
   - Scan media library
   - Load saved playlists

2. **Playback Flow**:
   - User selects track/playlist
   - AudioPlayerService loads track
   - Player state updates via usePlayer hook
   - UI components reflect current state

3. **Background Playback**:
   - Audio session maintains playback
   - Player state persists across app lifecycle
   - System controls integration

## Performance Considerations

### Background Audio Optimization
- Efficient audio session management
- Memory usage optimization
- Battery consumption monitoring
- Proper cleanup on app termination

### Media Library Scanning
- Incremental scanning for large libraries
- Metadata caching to reduce I/O
- Background scanning with progress indicators
- Error handling for corrupted files

### UI Performance
- Virtualized lists for large libraries
- Lazy loading of album artwork
- Efficient state management
- Optimized re-renders

## Security & Permissions

### Required Permissions
- **Media Library Access**: Scan and play music files
- **Audio Session**: Background audio playback
- **File System**: Playlist persistence

### Data Handling
- Local storage only (no cloud sync)
- Secure file system access
- Permission-based media access
