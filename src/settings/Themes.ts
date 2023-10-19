import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import {Colors} from './Colors';

export const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    text: Colors.dark.text,
    card: Colors.dark.background,
  },
};

export const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    text: Colors.light.text,
    card: Colors.light.background,
  },
};
