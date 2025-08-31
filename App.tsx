import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { mediaService } from './src/services/MediaService';
import { audioPlayerService } from './src/services/AudioPlayerService';
import { PlayerControls } from './src/components/PlayerControls';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  const [activeRouteName, setActiveRouteName] = useState<string>('');

  useEffect(() => {
    initializeApp();
    return () => {
      audioPlayerService.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      await mediaService.initialize();
      // console.log('Media service initialized successfully');
    } catch (error) {
      // console.error('Failed to initialize app:', error);
    }
  };

  const getActiveRouteName = (state: any): string => {
    const route = state.routes[state.index];
    if (route.state) {
      return getActiveRouteName(route.state);
    }
    return route.name;
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
			<SafeAreaView style={{ flex: 1 }} edges={['top']}>
				<NavigationContainer
					onStateChange={(state) => {
						if (state) {
							const currentRouteName = getActiveRouteName(state);
							setActiveRouteName(currentRouteName);
						}
					}}
				>
					<AppNavigator />
				</NavigationContainer>
			</SafeAreaView>
      {activeRouteName !== 'Now Playing' && <PlayerControls />}
    </SafeAreaProvider>
  );
}