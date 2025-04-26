import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from '../../src/Navigations/DrawerNavigator';

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}
