import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { OPENWEATHER_API_KEY } from './config';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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
};

type Props = NativeStackScreenProps<RootStackParamList, 'NewTask'>;

export default function NewTaskScreen({ route, navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const searchWeather = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Info', 'Please enter a location name');
      return;
    }

    setLoading(true);

    try {
      // First, get coordinates for the location
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      
      const geoResponse = await fetch(geoUrl);
      
      if (!geoResponse.ok) {
        throw new Error(`Location API error: ${geoResponse.status}`);
      }

      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        Alert.alert('Not Found', 'Location not found. Please try a different name.');
        return;
      }

      const { lat, lon } = geoData[0];
      const cityName = geoData[0].name;

      // Then get weather data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();

      if (!weatherData || !weatherData.main || !weatherData.weather || !weatherData.weather[0]) {
        throw new Error('Invalid weather data received');
      }

      const newWeatherData = {
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        location: cityName || searchQuery
      };

      setWeather(newWeatherData);
      
      // Pass weather data back to main app
      if (route.params?.onWeatherUpdate) {
        route.params.onWeatherUpdate(newWeatherData);
        navigation.goBack();
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      Alert.alert(
        'Error',
        'Unable to fetch weather data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Location</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchWeather}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={searchWeather}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {weather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherTitle}>Weather in {weather.location}</Text>
          <Text style={styles.weatherText}>Temperature: {weather.temperature}°C</Text>
          <Text style={styles.weatherText}>Humidity: {weather.humidity}%</Text>
          <Text style={styles.weatherText}>Conditions: {weather.description}</Text>
          <Image 
            style={styles.weatherIcon}
            source={{ 
              uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
              width: 100,
              height: 100,
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: 'green',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 50,
  },
  searchButtonDisabled: {
    backgroundColor: '#90EE90',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  weatherContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  weatherTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  weatherText: {
    fontSize: 16,
    marginBottom: 5,
  },
  weatherIcon: {
    marginTop: 10,
    borderRadius: 50,
  },
}); 