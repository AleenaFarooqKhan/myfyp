
import { View, Text, StyleSheet } from 'react-native';

const DriverNotifications = () => {
  return (
    <View style={styles.container}>
      <Text>Driver Notifications 📩</Text>
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

export default DriverNotifications;