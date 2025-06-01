
import { View, Text, StyleSheet, } from 'react-native';

const DriverHelp = () => {
  return (
    <View style={styles.container}>
      <Text>help driver 📩</Text>
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

export default DriverHelp;