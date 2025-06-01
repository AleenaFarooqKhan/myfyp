
import { View, Text, StyleSheet, } from 'react-native';

const SafetyDriver = () => {
  return (
    <View style={styles.container}>
      <Text>safet driver 📩</Text>
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

export default SafetyDriver;