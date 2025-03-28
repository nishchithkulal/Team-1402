import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CropScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crop Information</Text>

        <Text style={styles.cropTitle}>Wheat</Text>
        <Text style={styles.text}>
          Wheat is best cultivated in the spring and harvested in late summer. 
          It requires a temperate climate with moderate rainfall. 
          <Text style={styles.bold}> Type of Farming: Conventional Farming</Text>
        </Text>

        <Text style={styles.cropTitle}>Rice</Text>
        <Text style={styles.text}>
          Rice is typically planted in late spring and harvested in early autumn. 
          It thrives in warm, wet conditions and is often grown in flooded fields. 
          <Text style={styles.bold}> Type of Farming: Conventional Farming</Text>
        </Text>

        <Text style={styles.cropTitle}>Corn</Text>
        <Text style={styles.text}>
          Corn should be planted in late spring after the last frost and harvested in late summer to early fall. 
          It requires warm temperatures and plenty of sunlight. 
          <Text style={styles.bold}> Type of Farming: Conventional Farming</Text>
        </Text>

        <Text style={styles.cropTitle}>Soybeans</Text>
        <Text style={styles.text}>
          Soybeans are best planted in late spring and harvested in the fall. 
          They prefer warm weather and well-drained soil. 
          <Text style={styles.bold}> Type of Farming: Sustainable Farming</Text>
        </Text>

        <Text style={styles.cropTitle}>Potatoes</Text>
        <Text style={styles.text}>
          Potatoes are typically planted in early spring and harvested in late summer. 
          They grow best in cooler temperatures and well-drained soil. 
          <Text style={styles.bold}> Type of Farming: Organic Farming</Text>
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('Info')}>
          <Text style={styles.bold}>Learn about Types of Farming</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  cropTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#34495e',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    lineHeight: 24,
    color: '#7f8c8d',
  },
  bold: {
    fontWeight: 'bold',
    color: '#2980b9',
    fontSize: 18,
    marginVertical: 10,
  },
});

export default CropScreen;