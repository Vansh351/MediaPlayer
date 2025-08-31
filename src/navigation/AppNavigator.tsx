import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PlaylistsScreen } from '../screens/PlaylistsListing';
import { NowPlayingScreen } from '../screens/NowPlayingScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaylistDetailScreen } from '../screens/PlayList';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Playlists') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Now Playing') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Playlists" component={PlayListNavigator} />
      <Tab.Screen name="Now Playing" component={NowPlayingScreen} />
    </Tab.Navigator>
  );
};

const PlayListNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PlaylistListing" component={PlaylistsScreen} />
    <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
  </Stack.Navigator>
);