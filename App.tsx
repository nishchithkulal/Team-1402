import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import NewTaskScreen from './NewTaskScreen';
import React, { useState } from 'react';
import CropScreen from './crop';
import InfoScreen from './InfoScreen';

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  location: string;
}

type RootStackParamList = {
  MainTabs: undefined;
  NewTask: {
    onWeatherUpdate: (data: WeatherData) => void;
  };
  Info: undefined;
};

type TabStackParamList = {
  Tasks: undefined;
  Crop: undefined;
  Info: undefined;
};

const Tab = createBottomTabNavigator<TabStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainApp({ navigation }: any) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [tasks, setTasks] = useState<string[]>([]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {weatherData && (
        <View style={styles.weatherSummary}>
          <Text style={styles.locationText}>{weatherData.location}</Text>
          <View style={styles.weatherDetails}>
            <Text style={styles.weatherText}>{weatherData.temperature}°C</Text>
            <Text style={styles.weatherText}>{weatherData.description}</Text>
          </View>
        </View>
      )}

      {tasks.length === 0 ? (
        <Text style={styles.noTasksText}>No tasks currently added.</Text>
      ) : (
        <Text style={styles.tasksText}>Tasks will be listed here.</Text>
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('NewTask', {
          onWeatherUpdate: (data: WeatherData) => setWeatherData(data)
        })}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list';

          if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Crop') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Info') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Tasks" 
        component={MainApp} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Crop" 
        component={CropScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Info" 
        component={InfoScreen} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{
            headerTitle: 'AquaPredict',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="NewTask" 
          component={NewTaskScreen}
          options={{
            presentation: 'modal',
            headerTitle: 'Search Location'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  weatherSummary: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 16,
    color: '#444',
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: 'green',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  noTasksText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  tasksText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
