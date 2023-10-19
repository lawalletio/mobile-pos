import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import IntroScreen from '../screens/auth/IntroScreen';
import SignupSeedScreen from '../screens/auth/SignupSeedScreen';
import SignupPasswordScreen from '../screens/auth/SignupPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Intro">
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="SignupSeed" component={SignupSeedScreen} />
      <Stack.Screen name="SignupPassword" component={SignupPasswordScreen} />
    </Stack.Navigator>
  );
}
