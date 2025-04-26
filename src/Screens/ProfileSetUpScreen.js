import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const ProfileSetUpScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>How will you use Roam Together?</Text>
      <Text style={styles.subText}>
        Let us know how you intend to use Roam Together. This helps us send you relevant updates.
      </Text>

      <Image source={require('../../assets/profile.jpg')} style={styles.image} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginAsDriver')}>
          <Text style={styles.buttonText}> As a driver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginAsPassenger')}>
          <Text style={styles.buttonText}>As a passenger</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF2FF',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0056b3',
    marginHorizontal: 20,
  },
  subText: {
    fontSize: width * 0.04,
    color: '#004080',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  image: {
    width: width * 0.6,
    height: height * 0.3,
    resizeMode: 'contain',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: height * 0.02,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#0056b3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
});

export default ProfileSetUpScreen;
