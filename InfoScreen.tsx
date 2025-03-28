import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const InfoScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Types of Farming</Text>
      <Text style={styles.text}>
        1. <Text style={styles.bold}>Conventional Farming</Text>: This method uses synthetic fertilizers, pesticides, and herbicides to maximize crop yield. It often involves monoculture, where a single crop is grown over a large area.
      </Text>
      <Text style={styles.text}>
        2. <Text style={styles.bold}>Organic Farming</Text>: This approach avoids synthetic chemicals and focuses on natural processes. Organic farmers use crop rotation, composting, and biological pest control to maintain soil health and ecosystem balance.
      </Text>
      <Text style={styles.text}>
        3. <Text style={styles.bold}>Sustainable Farming</Text>: This method aims to meet current food needs without compromising future generations. It incorporates practices that protect the environment, enhance soil health, and promote biodiversity.
      </Text>
      <Text style={styles.text}>
        4. <Text style={styles.bold}>Permaculture</Text>: A holistic approach to farming that mimics natural ecosystems. It focuses on creating self-sustaining agricultural systems that require minimal external inputs.
      </Text>
      <Text style={styles.text}>
        5. <Text style={styles.bold}>Hydroponics</Text>: A method of growing plants without soil, using nutrient-rich water instead. This technique allows for year-round cultivation and is often used in urban farming.
      </Text>
      <Text style={styles.text}>
        6. <Text style={styles.bold}>Aquaponics</Text>: A combination of aquaculture (raising fish) and hydroponics. In this system, fish waste provides nutrients for the plants, and the plants help filter the water for the fish.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Light background color for better contrast
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50', // Darker color for the title
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
    lineHeight: 24, // Increased line height for better readability
    color: '#34495e', // Dark gray color for text
  },
  bold: {
    fontWeight: 'bold',
    color: '#2980b9', // Blue color for bold text
  },
});

export default InfoScreen; 