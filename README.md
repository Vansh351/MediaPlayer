# Advanced Media Player App

A feature-rich media player application built with React Native and Expo.

## Features

- ✅ Audio playback with background support
- ✅ Playlist management (create, edit, delete)
- ✅ Media library scanning and search
- ✅ Variable playback speed (0.5x - 2x)
- ✅ Shuffle and repeat modes
- ✅ Clean, intuitive UI

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Run on device**
   ```bash
   npm run ios     # iOS
   npm run android # Android
   ```

## Architecture

- **MediaService**: Media library scanning and playlist management
- **AudioPlayerService**: Audio playback and background audio
- **usePlayer Hook**: React state management for player
- **Navigation**: Bottom tab navigation with screens

## Permissions

- Media Library Access (for music files)
- Audio Session (for background playback)

## Project Structure

```
src/
├── components/     # UI components
├── screens/        # App screens
├── services/       # Business logic
├── hooks/          # Custom hooks
├── types/          # TypeScript types
└── navigation/     # Navigation
```
