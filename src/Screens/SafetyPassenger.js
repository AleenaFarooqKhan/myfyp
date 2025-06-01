
import { View, Text, StyleSheet, } from 'react-native';

const SafetyPassenger = () => {
  return (
    <View style={styles.container}>
      <Text>safety passsenger 📩</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // make it pretty if you want
  },
});

export default SafetyPassenger;