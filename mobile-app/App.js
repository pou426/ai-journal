import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JournalProvider, AuthProvider, useAuth } from './context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import AccountDetailsScreen from './screens/AccountDetailsScreen';
import AllJournalsScreen from './screens/AllJournalsScreen';
import SettingsScreen from './screens/SettingsScreen';
import SignInScreen from './screens/SignInScreen';
import TodayScreen from './screens/TodayScreen';
import ViewEntryScreen from './screens/ViewEntryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom logo title component
const LogoTitle = ({ title, showDate = false }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: '#333' }}>
        {title}
      </Text>
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#333',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen 
        name="Today" 
        component={TodayScreen}
        options={{
          headerTitle: () => <LogoTitle title="Today" showDate={true} />,
          headerShown: true,
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pen-plus" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="All Journals" 
        component={AllJournalsScreen}
        options={({ navigation, route }) => ({
          headerShown: true,
          headerTitle: () => <LogoTitle title="All Journals" />,
          // Use the headerRight option to allow the screen to pass a custom component
          headerRight: () => route.params?.headerRight ? route.params.headerRight() : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-multiple" size={size} color={color} />
          ),
        })}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
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
                headerTitle: 'View Entry',
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