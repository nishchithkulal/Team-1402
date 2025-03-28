import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPENWEATHER_API_KEY } from './config';

interface LocationData {
  latitude: number;
  longitude: number;
  location: string;
}

interface ClimateData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
}

export default function LocationMap() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get user's current location on component mount
  useEffect(() => {
    (async () => {
      try {
        // First check if location services are enabled
        const serviceEnabled = await Location.hasServicesEnabledAsync();
        if (!serviceEnabled) {
          setErrorMsg('Location services are disabled. Please enable them in your device settings.');
          setLocation({
            latitude: 17.4065,
            longitude: 78.4772,
            location: 'Default Location'
          });
          return;
        }

        // Then check for permissions
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLocation({
            latitude: 17.4065,
            longitude: 78.4772,
            location: 'Default Location'
          });
          return;
        }

        // Get location with high accuracy
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        });

        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          location: 'Current Location'
        });
        
      } catch (error) {
        console.log('Location error:', error);
        // Set default location but don't show error - just silently fall back
        setLocation({
          latitude: 17.4065,
          longitude: 78.4772,
          location: 'Default Location'
        });
      }
    })();
  }, []);

  // Function to fetch climate data from OpenWeather API
  const fetchClimateData = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      
      // Current weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Weather API request failed');
      }
      
      const weatherData = await weatherResponse.json();
      
      // Get rainfall data (if available) or use 0
      const rainfall = weatherData.rain && weatherData.rain['1h'] 
        ? weatherData.rain['1h'] 
        : weatherData.rain && weatherData.rain['3h']
          ? weatherData.rain['3h'] / 3
          : 0;
      
      const climateInfo: ClimateData = {
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        rainfall: rainfall,
        description: weatherData.weather[0].description,
      };
      
      setClimateData(climateInfo);
      
      // Store the data
      await saveClimateDataToDatabase(selectedLocation!, climateInfo);
      
    } catch (error) {
      console.error('Error fetching climate data:', error);
      Alert.alert('Error', 'Failed to fetch climate data from OpenWeather');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save climate data to a database
  const saveClimateDataToDatabase = async (locationData: LocationData, climateData: ClimateData) => {
    try {
      // Generate a unique key based on coordinates
      const key = `climate_${locationData.latitude.toFixed(4)}_${locationData.longitude.toFixed(4)}`;
      
      // Save location and climate data
      const dataToSave = {
        locationData,
        climateData,
        timestamp: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
      Alert.alert('Success', 'Location and climate data saved successfully!');
      
      // Also save to a list of saved locations for easy retrieval
      const savedLocationsJson = await AsyncStorage.getItem('saved_locations');
      let savedLocations = savedLocationsJson ? JSON.parse(savedLocationsJson) : [];
      
      // Check if location already exists in saved locations
      const locationExists = savedLocations.some(
        (loc: any) => 
          loc.latitude.toFixed(4) === locationData.latitude.toFixed(4) && 
          loc.longitude.toFixed(4) === locationData.longitude.toFixed(4)
      );
      
      if (!locationExists) {
        savedLocations.push({
          key,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          location: locationData.location,
          timestamp: new Date().toISOString(),
        });
        
        await AsyncStorage.setItem('saved_locations', JSON.stringify(savedLocations));
      }
      
    } catch (error) {
      console.error('Error saving data', error);
      Alert.alert('Error', 'Failed to save location data');
    }
  };

  // Handle map press to select location
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      location: 'Selected Location'
    });
  };

  // Get location name using reverse geocoding
  useEffect(() => {
    if (selectedLocation) {
      (async () => {
        try {
          const geoData = await Location.reverseGeocodeAsync({
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          });
          
          if (geoData.length > 0) {
            const address = geoData[0];
            const locationName = address.city || address.region || address.country || 'Selected Location';
            setSelectedLocation(prev => prev ? { ...prev, location: locationName } : null);
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
        }
      })();
    }
  }, [selectedLocation?.latitude, selectedLocation?.longitude]);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : !location ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="green" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : (
        <>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Tap anywhere on the map to select a location
            </Text>
          </View>
          
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            {/* Current location marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />

            {/* Selected location marker */}
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title={selectedLocation.location}
                pinColor="red"
              />
            )}
          </MapView>

          {selectedLocation && (
            <View style={styles.infoBox}>
              <Text style={styles.locationText}>
                Selected: {selectedLocation.location}
              </Text>
              <Text style={styles.coordsText}>
                Lat: {selectedLocation.latitude.toFixed(4)}, 
                Lon: {selectedLocation.longitude.toFixed(4)}
              </Text>
              
              {climateData && (
                <View style={styles.climateData}>
                  <Text style={styles.dataText}>Temperature: {climateData.temperature}°C</Text>
                  <Text style={styles.dataText}>Weather: {climateData.description}</Text>
                  <Text style={styles.dataText}>Humidity: {climateData.humidity}%</Text>
                  <Text style={styles.dataText}>Rainfall: {climateData.rainfall}mm</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.button}
                onPress={() => fetchClimateData(selectedLocation.latitude, selectedLocation.longitude)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>
                    {climateData ? 'Refresh Weather Data' : 'Get Weather Data'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '60%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
  instructionContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  infoBox: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: '30%',
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  coordsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  climateData: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  dataText: {
    fontSize: 15,
    marginBottom: 5,
  },
  button: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    height: 45,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 