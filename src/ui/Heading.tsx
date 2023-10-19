import React, {PropsWithChildren} from 'react';
import {PixelRatio, StyleSheet, Text as RNText} from 'react-native';
// import { useFonts, Merriweather_700Bold } from '@expo-google-fonts/merriweather'

import {Colors} from '../settings/Colors';
import {useColors} from '../hooks';

interface HeadingProps {
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  align?: 'left' | 'center' | 'right';
  theme?: 'auto' | 'dark' | 'light';
}

const Heading: React.FunctionComponent<PropsWithChildren<HeadingProps>> = ({
  children,
  type = 'h1',
  align = 'left',
  theme = 'auto',
}) => {
  // const [fontsLoaded] = useFonts({ Merriweather_700Bold })

  const color = useColors();
  const fontScale = PixelRatio.getFontScale();
  const getFontSize = (size: number) => size / fontScale;

  // if (!fontsLoaded) {
  //   return null
  // }

  const styles = StyleSheet.create({
    h1: {
      fontSize: getFontSize(32),
      lineHeight: getFontSize(38),
    },
    h2: {
      fontSize: getFontSize(26),
      lineHeight: getFontSize(32),
    },
    h3: {
      fontSize: getFontSize(22),
      lineHeight: getFontSize(28),
    },
    h4: {
      fontSize: getFontSize(20),
      lineHeight: getFontSize(26),
    },
    h5: {
      fontSize: getFontSize(18),
      lineHeight: getFontSize(24),
    },
    h6: {
      fontSize: getFontSize(16),
      lineHeight: getFontSize(22),
    },
    base: {
      color: theme === 'auto' ? color.text : Colors[theme].text,
      // fontFamily: 'Merriweather_700Bold',
      fontWeight: 'bold',
      textAlign: align,
    },
  });

  return <RNText style={[styles.base, styles[type]]}>{children}</RNText>;
};

export default Heading;
