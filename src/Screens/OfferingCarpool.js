import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, ScrollView, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../Global/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;

const OfferingCarpool = () => {
  const [seats, setSeats] = useState('');
  const [fare, setFare] = useState('');
  const [error, setError] = useState('');
  const [isAM, setIsAM] = useState(true); // State to toggle AM/PM
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [via, setVia] = useState('');

  const handleDateChange = useCallback((text) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 4 && cleaned.length <= 6) {
      cleaned = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else if (cleaned.length > 6) {
      cleaned = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
    setDate(cleaned);

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (cleaned && !datePattern.test(cleaned)) {
      setError('Use format: YYYY-MM-DD');
    } else {
      setError('');
    }
  }, []);

 

  const handleSeatsChange = useCallback((text) => {
    setSeats(text);
    setError('');
  }, []);

  const handleFareChange = useCallback((text) => {
    setFare(text);
    setError('');
  }, []);

  const handleFromChange = useCallback((text) => {
    setFrom(text);
    setError('');
  }, []);

  const handleToChange = useCallback((text) => {
    setTo(text);
    setError('');
  }, []);

  const handleViaChange = useCallback((text) => {
    setVia(text);
    setError('');
  }, []);



  const saveCarpoolHistory = async (newCarpool) => {
    try {
      const existingHistory = await AsyncStorage.getItem('carpoolHistory');
      let history = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Add new carpool to the beginning of the array
      history.unshift(newCarpool);
      
      // Keep only the 4 most recent entries
      if (history.length > 4) {
        history = history.slice(0, 4);
      }
      
      await AsyncStorage.setItem('carpoolHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving carpool history:', error);
    }
  };

  const handleSubmit = async () => {
    if (!from || !to || !time || !seats || !fare) {
      setError('Please fill in all fields');
      return;
    }

    const newCarpool = {
      from,
      to,
      via,
      seats,
      fare,
    };

    await saveCarpoolHistory(newCarpool);
    alert('Carpool offered successfully!');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ alignItems: 'center', flexGrow: 1, paddingBottom: 20 }}
      >
        {/* Header Button Style Title */}
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Offer Carpool</Text>
        </View>

        {/* Input Fields */}
        <GlassInput label="From" placeholder="Enter starting point" value={from} onChangeText={handleFromChange} />
        <GlassInput label="Via" placeholder="Enter preferred route" value={via} onChangeText={handleViaChange} />
        <GlassInput label="To" placeholder="Enter destination" value={to} onChangeText={handleToChange} />
    
     
        <GlassInput label="Seats Available" placeholder="Enter number of seats" keyboardType="numeric" value={seats} onChangeText={handleSeatsChange} />
        <GlassInput label="Total Fare" placeholder="Enter total fare" keyboardType="numeric" value={fare} onChangeText={handleFareChange} />

        {/* Create Carpool Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={ !seats || !fare || !from || !to}
          style={[styles.button, { backgroundColor:  !seats || !fare || !from || !to ? '#ddd' : '#2058c0' }]}
        >
          <Text style={[styles.buttonText, { color:  !seats || !fare || !from || !to ? '#aaa' : '#fff' }]}>Create Carpool</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const GlassInput = ({ label, placeholder, keyboardType = 'default', showAmPmToggle = false, value, onChangeText, isAM, toggleAMPM }) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <BlurView intensity={100} tint="light" style={styles.inputBox}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#cce0ff"
          style={styles.inputText}
          keyboardType={keyboardType}
        />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,  // Removed paddingTop to raise the header to the top of the screen
  },

  headerBox: {
    backgroundColor: '#2058c0',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 20, // Reduced margin from 30 to 20 for closer alignment
    marginTop: -20, // No margin at the top, keeps header aligned with the top of the screen
  },

  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  inputWrapper: {
    width: SCREEN_WIDTH * 0.9,
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2058c0',
    marginBottom: 8,
  },

  inputBox: {
    backgroundColor: 'rgba(32, 88, 192, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputText: {
    fontSize: 16,
    color: '#003366',
    flex: 1,
  },

  amPmButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#2058c0',
    borderRadius: 15,
    marginLeft: 10,
  },

  amPmText: {
    color: '#fff',
    fontWeight: '600',
  },

  button: {
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 10, // Adjust to raise the button slightly
    marginBottom: 20, // Add space to avoid bottom bar overlap
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH * 0.9,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
});

export default OfferingCarpool;
