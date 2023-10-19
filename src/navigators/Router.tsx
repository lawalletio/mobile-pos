import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import AppStack from './AppStack';
import AuthStack from './AuthStack';
import {useAuthentication} from '../context/authentication';

const Stack = createNativeStackNavigator();

export default function Router() {
  const {logued} = useAuthentication();

  const CurrentStack = logued ? AppStack : AuthStack;
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="App">
      <Stack.Screen name="AppStack" component={CurrentStack} />
    </Stack.Navigator>
  );
}
