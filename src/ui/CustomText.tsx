import React, {PropsWithChildren} from 'react';
import {PixelRatio, StyleSheet, Text as RNText} from 'react-native';
// import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'

import {Colors} from '../settings/Colors';
import {useColors} from '../hooks';
interface TextProps {
  size?: 'normal' | 'small';
  fontWeight?: 'normal' | 'bold';
  align?: 'left' | 'center' | 'right';
  opacity?: 65 | 100;
  theme?: 'auto' | 'dark' | 'light';
}

const CustomText: React.FunctionComponent<PropsWithChildren<TextProps>> = ({
  children,
  size = 'normal',
  fontWeight = 'normal',
  align = 'left',
  opacity = 100,
  theme = 'auto',
}) => {
  // const [fontsLoaded] = useFonts({ Montserrat_400Regular, Montserrat_700Bold })

  const color = useColors();
  const fontScale = PixelRatio.getFontScale();
  const getFontSize = (fontSize: number) => fontSize / fontScale;

  // if (!fontsLoaded) {
  //   return null
  // }

  const isSmall = size === 'small';
  // const isBold = fontWeight === 'bold'

  const styles = StyleSheet.create({
    base: {
      opacity: opacity / 100,
      color: theme === 'auto' ? color.text : Colors[theme].text,
      // fontFamily: isBold ? 'Montserrat_700Bold' : 'Montserrat_400Regular',
      fontSize: getFontSize(isSmall ? 14 : 16),
      lineHeight: getFontSize(isSmall ? 18 : 22),
      fontWeight,
      textAlign: align,
    },
  });

  return <RNText style={[styles.base]}>{children}</RNText>;
};

export default CustomText;
