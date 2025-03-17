import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import EditScreen from './screens/EditScreen';
import HomeScreen from './screens/HomeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Create a stack navigator for the All Journals tab
function JournalsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#333',
      }}
    >
      <Stack.Screen 
        name="JournalsList"
        component={HomeScreen}
        options={{
          headerTitle: () => <LogoTitle title="All Journals" />,
        }}
      />
      <Stack.Screen 
        name="Edit"
        component={EditScreen}
        options={{ 
          title: 'View Entry',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
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

// Create Today's entry screen
function TodayScreen() {
  return <EditScreen isToday={true} />;
}

export default function App() {
  return (
    <NavigationContainer>
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
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#fff',
            },
            tabBarLabel: 'Today',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="pen-plus" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="All Journals" 
          component={JournalsStack}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="notebook-multiple" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
} 