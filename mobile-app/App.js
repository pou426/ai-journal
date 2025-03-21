import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';
import SignInScreen from './screens/SignInScreen';
import EditScreen from './screens/EditScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import { JournalProvider, AuthProvider, useAuth } from './context';
import AccountDetailsScreen from './screens/AccountDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
        component={EditScreen}
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
        component={HomeScreen}
        options={{
          headerShown: true,
          headerTitle: () => <LogoTitle title="All Journals" />,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-multiple" size={size} color={color} />
          ),
        }}
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

// Update the LogoTitle component to handle date display
function LogoTitle({ title, showDate = false }) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <MaterialCommunityIcons 
        name={title === "Today" ? "pen-plus" : "notebook-multiple"} 
        size={24} 
        color="#333" 
      />
      <Text style={{ 
        marginLeft: 8,
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
      }}>
        {showDate ? formattedDate : title}
      </Text>
    </View>
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
              component={EditScreen}
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