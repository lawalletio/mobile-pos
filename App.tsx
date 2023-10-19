/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {LogBox, StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';

import AuthenticationProvider from './src/context/authentication';
import {CustomDarkTheme, CustomLightTheme} from './src/settings/Themes';
import Router from './src/navigators/Router';
import {useColors} from './src/hooks';

import {StyleSheet, View} from 'react-native';
import {Logo} from './src/ui';

LogBox.ignoreAllLogs();

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const Colors = useColors();

  const backgroundStyle = {
    backgroundColor: Colors.background,
  };

  return (
    // <View style={{width: 220, height: 80}}>
    //   <Logo />
    // </View>
    <NavigationContainer
      ref={undefined}
      theme={isDarkMode ? CustomDarkTheme : CustomLightTheme}>
      <AuthenticationProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <Router />
      </AuthenticationProvider>
    </NavigationContainer>
  );
}

export default App;
