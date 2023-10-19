import React from 'react';
import {StyleSheet, TextInput, View, PixelRatio} from 'react-native';
import {useColors, useDeviceDimensions} from '../hooks';

import Divider from './Divider';
import CustomText from './CustomText';

interface InputValueProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

const InputValue = (
  {value, onChange, placeholder = ''}: InputValueProps,
  ref: any,
) => {
  const {isDeviceSmall} = useDeviceDimensions();
  const fontScale = PixelRatio.getFontScale();
  const getFontSize = (size: number) => size / fontScale;

  const colors = useColors();
  const styles = StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,

      paddingRight: 12,
      paddingVertical: 8,

      backgroundColor: colors.gray5,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.gray5,
    },
    normalDevice: {
      minHeight: 60,
    },
    smallDevice: {
      minHeight: 45,
    },
    currency: {
      justifyContent: 'center',

      paddingHorizontal: 22,
      paddingVertical: 8,

      borderRightWidth: 1,
      borderRightColor: colors.gray15,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: getFontSize(16),
      lineHeight: getFontSize(22),
    },
  });

  const handleChange = (inputValue: string) => {
    onChange(inputValue);
  };

  return (
    <View
      style={[
        styles.base,
        isDeviceSmall ? styles.smallDevice : styles.normalDevice,
      ]}>
      <View style={styles.currency}>
        <CustomText>USD</CustomText>
      </View>
      <Divider x={12} />
      <TextInput
        ref={ref}
        placeholder={placeholder}
        value={value}
        style={styles.input}
        returnKeyType="next"
        secureTextEntry
        onChangeText={handleChange}
      />
    </View>
  );
};

const forwaredSeedInputValue = React.forwardRef(InputValue);

export default forwaredSeedInputValue;
