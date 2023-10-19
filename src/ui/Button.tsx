import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  PixelRatio,
  View,
} from 'react-native';

import {useColors, useDeviceDimensions} from '../hooks';
import {ButtonColor} from '../settings/Colors';

interface ButtonProps {
  title?: string;
  type?: 'filled' | 'bezeled' | 'bezeledGray' | 'borderless';
  color?: ButtonColor;
  size?: 'small' | 'large';
  disabled?: boolean;
  onPress: () => void;
  children?: any;
  isBlock?: boolean;
}

const Button: React.FunctionComponent<ButtonProps> = ({
  title,
  type = 'filled',
  color = 'primary',
  size = 'large',
  disabled = false,
  onPress,
  children,
  isBlock = false,
}) => {
  const {isDeviceSmall} = useDeviceDimensions();
  const colorScheme = useColors();
  const fontScale = PixelRatio.getFontScale();
  const getFontSize = (fontSize: number) => fontSize / fontScale;

  const isLarge = size === 'large';
  const isSolid = type === 'filled';

  const dimensions = {
    height: 30,
    largeHeight: isDeviceSmall ? 45 : 60,
    minWidth: 30,
    largeMinWidth: 60,
  };

  const styles = StyleSheet.create({
    base: {
      justifyContent: 'center',
      alignItems: 'center',
      width: isBlock ? '100%' : undefined,
      height: isLarge ? dimensions.largeHeight : dimensions.height,
      minWidth: isLarge ? dimensions.largeMinWidth : dimensions.minWidth,

      paddingHorizontal: 10,
      paddingVertical: 4,

      borderRadius: 12,

      fontWeight: 'bold',
    },
    filled: {
      backgroundColor: colorScheme[color],
    },
    bezeled: {
      color: colorScheme[color],
      backgroundColor: `${colorScheme[color]}26`,
    },
    bezeledGray: {
      color: colorScheme[color],
      backgroundColor: colorScheme.gray5,
    },
    borderless: {
      color: colorScheme[color],
      backgroundColor: 'transparent',
    },
    text: {
      textAlign: 'center',
      color: isSolid ? colorScheme.background : colorScheme[color],
      fontSize: getFontSize(isLarge ? 16 : 14),
      fontWeight: 'bold',
    },
    disabled: {
      backgroundColor: colorScheme.gray35,
    },
  });

  if (disabled) {
    return (
      <View style={[styles.base, styles.disabled]}>
        {children ? children : <Text style={styles.text}>{title}</Text>}
      </View>
    );
  } else {
    return (
      <TouchableOpacity
        onPress={!disabled ? onPress : () => null}
        style={[styles.base, styles[type]]}>
        {children ? children : <Text style={styles.text}>{title}</Text>}
      </TouchableOpacity>
    );
  }
};

export default Button;
