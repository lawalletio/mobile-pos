import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DashboardScreen from '../screens/app/DashboardScreen';
import TransferScreen from '../screens/app/TransferScreen';
import TransferAmmountScreen from '../screens/app/TransferAmmountScreen';
import TransferSummaryScreen from '../screens/app/TransferSummaryScreen';
import TransferSuccessScreen from '../screens/app/TransferSuccessScreen';
import ReceiveScreen from '../screens/app/ReceiveScreen';
import SecurityOnboardingScreen from '../screens/app/SecurityOnboardingScreen';
import SeedPreviewScreen from '../screens/app/SeedPreviewScreen';
import CheckSeedSuccessScreen from '../screens/app/CheckSeedSuccessScreen';
import CheckSeedScreen from '../screens/app/CheckSeedScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{headerShown: false}}
      />
      {/* <Stack.Screen
        name="Transfer"
        component={TransferScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TransferAmmount"
        component={TransferAmmountScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TransferSummary"
        component={TransferSummaryScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TransferSuccess"
        component={TransferSuccessScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{presentation: 'modal', headerShown: false}}
      />
      <Stack.Screen
        name="SecurityOnboarding"
        component={SecurityOnboardingScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SeedPreview"
        component={SeedPreviewScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CheckSeedSuccess"
        component={CheckSeedSuccessScreen}
        options={{headerShown: false, gestureEnabled: false}}
      />
      <Stack.Screen
        name="CheckSeed"
        component={CheckSeedScreen}
        options={{headerShown: false}}
      /> */}
    </Stack.Navigator>
  );
}
