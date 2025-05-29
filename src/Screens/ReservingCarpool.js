// import React, { useState, useCallback } from 'react';
// import { View, Text, TextInput, StyleSheet, Dimensions, ScrollView, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
// import { BlurView } from 'expo-blur';
// import { colors } from '../Global/Styles';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const SCREEN_WIDTH = Dimensions.get('window').width;

// const ReservingCarpool = () => {
//   const [date, setDate] = useState('');
//   const [time, setTime] = useState('');
//   const [seats, setSeats] = useState('');
//   const [fare, setFare] = useState('');
//   const [error, setError] = useState('');
//   const [isAM, setIsAM] = useState(true); // State to toggle AM/PM
//   const [from, setFrom] = useState('');
//   const [to, setTo] = useState('');
//   const [via, setVia] = useState('');

//   const handleDateChange = useCallback((text) => {
//     let cleaned = text.replace(/[^0-9]/g, '');
//     if (cleaned.length > 4 && cleaned.length <= 6) {
//       cleaned = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
//     } else if (cleaned.length > 6) {
//       cleaned = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
//     }
//     setDate(cleaned);

//     const datePattern = /^\d{4}-\d{2}-\d{2}$/;
//     if (cleaned && !datePattern.test(cleaned)) {
//       setError('Use format: YYYY-MM-DD');
//     } else {
//       setError('');
//     }
//   }, []);

//   const handleTimeChange = useCallback((text) => {
//     let cleaned = text.replace(/[^0-9]/g, '');
//     if (cleaned.length > 2) {
//       cleaned = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
//     }
//     setTime(cleaned);

//     const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;
//     if (cleaned && !timePattern.test(cleaned)) {
//       setError('Use format: hh:mm');
//     } else {
//       setError('');
//     }
//   }, []);

//   const handleSeatsChange = useCallback((text) => {
//     setSeats(text);
//     setError('');
//   }, []);

//   const handleFareChange = useCallback((text) => {
//     setFare(text);
//     setError('');
//   }, []);

//   const handleFromChange = useCallback((text) => {
//     setFrom(text);
//     setError('');
//   }, []);

//   const handleToChange = useCallback((text) => {
//     setTo(text);
//     setError('');
//   }, []);

//   const handleViaChange = useCallback((text) => {
//     setVia(text);
//     setError('');
//   }, []);

//   // Toggle AM/PM
//   const toggleAMPM = () => {
//     setIsAM(!isAM);
//   };

//   const saveCarpoolHistory = async (newCarpool) => {
//     try {
//       const existingHistory = await AsyncStorage.getItem('carpoolHistory');
//       let history = existingHistory ? JSON.parse(existingHistory) : [];
      
//       // Add new carpool to the beginning of the array
//       history.unshift(newCarpool);
      
//       // Keep only the 4 most recent entries
//       if (history.length > 4) {
//         history = history.slice(0, 4);
//       }
      
//       await AsyncStorage.setItem('carpoolHistory', JSON.stringify(history));
//     } catch (error) {
//       console.error('Error saving carpool history:', error);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!from || !to || !date || !time || !seats || !fare) {
//       setError('Please fill in all fields');
//       return;
//     }

//     const newCarpool = {
//       from,
//       to,
//       via,
//       date,
//       time: `${time} ${isAM ? 'AM' : 'PM'}`,
//       seats,
//       fare,
//       timestamp: new Date().toISOString()
//     };

//     await saveCarpoolHistory(newCarpool);
//     alert('Carpool offered successfully!');
//   };

//   return (
//     <KeyboardAvoidingView 
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
//       style={styles.container}
//     >
//       <ScrollView 
//         style={styles.container} 
//         contentContainerStyle={{ alignItems: 'center', flexGrow: 1, paddingBottom: 20 }}
//       >
//         {/* Header Button Style Title */}
//         <View style={styles.headerBox}>
//           <Text style={styles.headerText}>Offer Carpool</Text>
//         </View>

//         {/* Input Fields */}
//         <GlassInput label="From" placeholder="Enter starting point" value={from} onChangeText={handleFromChange} />
//         <GlassInput label="Via" placeholder="Enter preferred route" value={via} onChangeText={handleViaChange} />
//         <GlassInput label="To" placeholder="Enter destination" value={to} onChangeText={handleToChange} />
//         <GlassInput label="Date" placeholder="YYYY-MM-DD" keyboardType="numeric" value={date} onChangeText={handleDateChange} />
//         <GlassInput 
//           label="Time" 
//           placeholder="hh:mm" 
//           keyboardType="numeric" 
//           value={time} 
//           onChangeText={handleTimeChange} 
//           showAmPmToggle
//           isAM={isAM} 
//           toggleAMPM={toggleAMPM}  // Pass the toggle function to the input field
//         />
//         <GlassInput label="Seats Available" placeholder="Enter number of seats" keyboardType="numeric" value={seats} onChangeText={handleSeatsChange} />
//         <GlassInput label="Total Fare" placeholder="Enter total fare" keyboardType="numeric" value={fare} onChangeText={handleFareChange} />

//         {/* Create Carpool Button */}
//         <TouchableOpacity
//           onPress={handleSubmit}
//           disabled={!date || !time || !seats || !fare || !from || !to}
//           style={[styles.button, { backgroundColor: !date || !time || !seats || !fare || !from || !to ? '#ddd' : '#2058c0' }]}
//         >
//           <Text style={[styles.buttonText, { color: !date || !time || !seats || !fare || !from || !to ? '#aaa' : '#fff' }]}>Create Carpool</Text>
//         </TouchableOpacity>

//         {error && <Text style={styles.errorText}>{error}</Text>}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const GlassInput = ({ label, placeholder, keyboardType = 'default', showAmPmToggle = false, value, onChangeText, isAM, toggleAMPM }) => {
//   return (
//     <View style={styles.inputWrapper}>
//       <Text style={styles.label}>{label}</Text>
//       <BlurView intensity={100} tint="light" style={styles.inputBox}>
//         <TextInput
//           value={value}
//           onChangeText={onChangeText}
//           placeholder={placeholder}
//           placeholderTextColor="#cce0ff"
//           style={styles.inputText}
//           keyboardType={keyboardType}
//         />
//         {showAmPmToggle && (
//           <TouchableOpacity style={styles.amPmButton} onPress={toggleAMPM}>
//             <Text style={styles.amPmText}>{isAM ? 'AM' : 'PM'}</Text>
//           </TouchableOpacity>
//         )}
//       </BlurView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     paddingTop: 20,  // Removed paddingTop to raise the header to the top of the screen
//   },

//   headerBox: {
//     backgroundColor: '#2058c0',
//     borderRadius: 25,
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     marginBottom: 20, // Reduced margin from 30 to 20 for closer alignment
//     marginTop: -20, // No margin at the top, keeps header aligned with the top of the screen
//   },

//   headerText: {
//     color: '#ffffff',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },

//   inputWrapper: {
//     width: SCREEN_WIDTH * 0.9,
//     marginBottom: 20,
//   },

//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2058c0',
//     marginBottom: 8,
//   },

//   inputBox: {
//     backgroundColor: 'rgba(32, 88, 192, 0.2)',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: Platform.OS === 'ios' ? 15 : 10,
//     justifyContent: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   inputText: {
//     fontSize: 16,
//     color: '#003366',
//     flex: 1,
//   },

//   amPmButton: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     backgroundColor: '#2058c0',
//     borderRadius: 15,
//     marginLeft: 10,
//   },

//   amPmText: {
//     color: '#fff',
//     fontWeight: '600',
//   },

//   button: {
//     paddingVertical: 15,
//     paddingHorizontal: 50,
//     borderRadius: 25,
//     marginTop: 10, // Adjust to raise the button slightly
//     marginBottom: 20, // Add space to avoid bottom bar overlap
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: SCREEN_WIDTH * 0.9,
//   },

//   buttonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

//   errorText: {
//     color: 'red',
//     marginTop: 5,
//     fontSize: 12,
//   },
// });

// export default ReservingCarpool;
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, ScrollView, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { colors } from '../Global/Styles'; // Assuming you have a Global/Styles file for color
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;

const ReservingCarpool = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
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

  const handleTimeChange = useCallback((text) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 2) {
      cleaned = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    }
    setTime(cleaned);

    const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;
    if (cleaned && !timePattern.test(cleaned)) {
      setError('Use format: hh:mm');
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

  // Toggle AM/PM
  const toggleAMPM = () => {
    setIsAM(!isAM);
  };

  const saveCarpoolToBackend = async (newCarpool) => {
    try {
      // Replace the AsyncStorage logic with an API request
      const response = await fetch(`${API_BASE_URL}/api/carpool/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCarpool),
      });

      if (!response.ok) {
        throw new Error('Failed to save carpool');
      }

      const data = await response.json();
      console.log('Carpool saved:', data);
      return data;
    } catch (error) {
      console.error('Error saving carpool to backend:', error);
      setError('Error saving carpool. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!from || !to || !date || !time || !seats || !fare) {
      setError('Please fill in all fields');
      return;
    }

    const newCarpool = {
      from,
      to,
      via,
      date,
      time: `${time} ${isAM ? 'AM' : 'PM'}`,
      seats,
      fare,
      timestamp: new Date().toISOString()
    };

    // Save to backend instead of AsyncStorage
    const savedCarpool = await saveCarpoolToBackend(newCarpool);

    if (savedCarpool) {
      alert('Carpool reserved successfully!');
    }
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
          <Text style={styles.headerText}>Reserve Carpool</Text>
        </View>

        {/* Input Fields */}
        <GlassInput label="From" placeholder="Enter starting point" value={from} onChangeText={handleFromChange} />
        <GlassInput label="Via" placeholder="Enter preferred route" value={via} onChangeText={handleViaChange} />
        <GlassInput label="To" placeholder="Enter destination" value={to} onChangeText={handleToChange} />
        <GlassInput label="Date" placeholder="YYYY-MM-DD" keyboardType="numeric" value={date} onChangeText={handleDateChange} />
        <GlassInput 
          label="Time" 
          placeholder="hh:mm" 
          keyboardType="numeric" 
          value={time} 
          onChangeText={handleTimeChange} 
          showAmPmToggle
          isAM={isAM} 
          toggleAMPM={toggleAMPM}  // Pass the toggle function to the input field
        />
        <GlassInput label="Seats Available" placeholder="Enter number of seats" keyboardType="numeric" value={seats} onChangeText={handleSeatsChange} />
        <GlassInput label="Total Fare" placeholder="Enter total fare" keyboardType="numeric" value={fare} onChangeText={handleFareChange} />

        {/* Reserve Carpool Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!date || !time || !seats || !fare || !from || !to}
          style={[styles.button, { backgroundColor: !date || !time || !seats || !fare || !from || !to ? '#ddd' : '#2058c0' }]} >
          <Text style={[styles.buttonText, { color: !date || !time || !seats || !fare || !from || !to ? '#aaa' : '#fff' }]}>Reserve Carpool</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const GlassInput = ({ label, value, onChangeText, placeholder, keyboardType, showAmPmToggle, isAM, toggleAMPM }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
      {showAmPmToggle && (
        <TouchableOpacity onPress={toggleAMPM} style={styles.amPmButton}>
          <Text style={styles.amPmText}>{isAM ? 'AM' : 'PM'}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  headerBox: {
    width: SCREEN_WIDTH,
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
  },
  inputContainer: {
    marginTop: 15,
    width: '90%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.darkGray,
    borderRadius: 5,
    paddingLeft: 10,
  },
  amPmButton: {
    paddingLeft: 10,
  },
  amPmText: {
    fontSize: 18,
    color: colors.primary,
  },
  button: {
    marginTop: 30,
    width: '90%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default ReservingCarpool;

