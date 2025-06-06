import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/car-animation.json')}
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.title}>Roam Together</Text>
      <Text style={styles.subtitle}>Travel Together{"\n"}Save Money</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProfileSetUpScreen')}>
        <Ionicons name="arrow-forward" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  animation: {
    width: width,
    height: height * 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default SplashScreen;
