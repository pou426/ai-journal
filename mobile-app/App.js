import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JournalProvider, AuthProvider, useAuth } from './context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { AddSnippetDialog } from './components';
import AccountDetailsScreen from './screens/AccountDetailsScreen';
import AllJournalsScreen from './screens/AllJournalsScreen';
import DashboardScreen from './screens/DashboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import SignInScreen from './screens/SignInScreen';
import TodayScreen from './screens/TodayScreen';
import ViewEntryScreen from './screens/ViewEntryScreen';
import React, { useState, useCallback, useRef } from 'react';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom logo title component
const LogoTitle = ({ title, showDate = false, iconName }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {iconName && (
        <MaterialCommunityIcons 
          name={iconName} 
          size={20} 
          color="#333" 
          style={{ marginRight: 6 }}
        />
      )}
      <Text style={{ fontSize: 17, fontWeight: '600', color: '#333' }}>
        {title}
      </Text>
    </View>
  );
};

function MainTabs() {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const todayScreenRef = useRef(null);

  const openDialog = () => {
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const handleSnippetAdded = useCallback((newSnippet, isGeneratingJournal) => {
    // Increment the refresh trigger to notify screens to update
    const updatedRefreshTrigger = refreshTrigger + 1;
    setRefreshTrigger(updatedRefreshTrigger);
    
    // If we have a reference to the Today screen's navigation, use it
    if (todayScreenRef.current) {
      // Pass both the refreshTrigger and the newSnippet if available
      todayScreenRef.current.setParams({
        refreshTrigger: updatedRefreshTrigger,
        newSnippet: newSnippet,
        isGeneratingJournal: isGeneratingJournal
      });
    }
  }, [refreshTrigger]);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#333',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#eee',
            height: Platform.OS === 'ios' ? 80 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          },
        }}
        tabBar={props => (
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: '#fff',
            height: Platform.OS === 'ios' ? 80 : 60,
            borderTopWidth: 1,
            borderTopColor: '#eee',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          }}>
            {/* First two tabs */}
            {props.state.routes.slice(0, 2).map((route, index) => {
              const { options } = props.descriptors[route.key];
              const label = options.tabBarLabel || options.title || route.name;
              const isFocused = props.state.index === index;

              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  // If we're pressing the Today tab, store its navigation ref
                  if (route.name === 'Today') {
                    todayScreenRef.current = props.navigation;
                  }
                  props.navigation.navigate(route.name);
                }
              };

              const Icon = options.tabBarIcon ? 
                options.tabBarIcon({ 
                  color: isFocused ? '#333' : '#999', 
                  size: 24 
                }) : null;

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  style={{ 
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {Icon}
                  <Text style={{ 
                    fontSize: 10, 
                    marginTop: 4,
                    color: isFocused ? '#333' : '#999' 
                  }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Center Add Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#333',
                width: 46,
                height: 46,
                borderRadius: 23,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
              }}
              onPress={openDialog}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
            
            {/* Last two tabs */}
            {props.state.routes.slice(3, 5).map((route, index) => {
              // Adjust index to account for the actual position in the routes array
              const actualIndex = index + 3;
              const { options } = props.descriptors[route.key];
              const label = options.tabBarLabel || options.title || route.name;
              const isFocused = props.state.index === actualIndex;

              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };

              const Icon = options.tabBarIcon ? 
                options.tabBarIcon({ 
                  color: isFocused ? '#333' : '#999', 
                  size: 24 
                }) : null;

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  style={{ 
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {Icon}
                  <Text style={{ 
                    fontSize: 10, 
                    marginTop: 4,
                    color: isFocused ? '#333' : '#999' 
                  }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      >
        <Tab.Screen 
          name="Today" 
          component={TodayScreen}
          initialParams={{ refreshTrigger }}
          options={{
            headerTitle: () => <LogoTitle title="Today" showDate={true} iconName="pen-plus" />,
            headerShown: true,
            tabBarLabel: 'Today',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="pen-plus" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Journals" 
          component={AllJournalsScreen}
          initialParams={{ refreshTrigger }}
          options={({ navigation, route }) => ({
            headerShown: true,
            headerTitle: () => <LogoTitle title="Journals" iconName="notebook-multiple" />,
            // Use the headerRight option to allow the screen to pass a custom component
            headerRight: () => route.params?.headerRight ? route.params.headerRight() : null,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="notebook-multiple" size={size} color={color} />
            ),
          })}
        />
        {/* This is a placeholder for the center button position - it won't be visible */}
        <Tab.Screen 
          name="AddPlaceholder" 
          component={View}
          options={{
            tabBarButton: () => null, // Don't render a button for this tab
          }}
        />
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            headerShown: true,
            headerTitle: () => <LogoTitle title="Dashboard" iconName="chart-box" />,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-box" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerTitle: () => <LogoTitle title="Settings" iconName="cog" />,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      <AddSnippetDialog 
        visible={dialogVisible} 
        onClose={closeDialog} 
        onSnippetAdded={handleSnippetAdded}
      />
    </>
  );
}

// Navigation container with authentication state
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // User is not authenticated - only show SignIn
          <Stack.Screen name="SignIn" component={SignInScreen} />
        ) : (
          // User is authenticated - show all screens
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="ViewEntry" 
              component={ViewEntryScreen}
              options={{ 
                headerShown: true,
                headerBackTitle: 'Back',
                headerTintColor: '#333',
                headerStyle: {
                  backgroundColor: '#fff',
                },
              }}
            />
            <Stack.Screen 
              name="AccountDetails" 
              component={AccountDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="SignIn" component={SignInScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <JournalProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </JournalProvider>
    </AuthProvider>
  );
} 