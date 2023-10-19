import React from 'react';
import {StyleSheet, TextInput} from 'react-native';

import {useColors, useDeviceDimensions} from '../hooks';

interface NumericInputProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

const NumericInput = (
  {value, onChange, placeholder = ''}: NumericInputProps,
  ref: any,
) => {
  const {isDeviceSmall} = useDeviceDimensions();
  const colors = useColors();
  const styles = StyleSheet.create({
    input: {
      backgroundColor: colors.gray5,
      paddingHorizontal: 20,
      color: colors.text,
      borderRadius: 10,
      flex: 1,
    },
    smallDevice: {
      height: 45,
    },
    normalDevice: {
      height: 50,
    },
  });

  const handleChange = (inputValue: string) => {
    onChange(inputValue);
  };

  return (
    <TextInput
      ref={ref}
      placeholder={placeholder}
      value={value}
      style={[
        styles.input,
        isDeviceSmall ? styles.smallDevice : styles.normalDevice,
      ]}
      returnKeyType="next"
      keyboardType="numeric"
      maxLength={6}
      secureTextEntry
      onChangeText={handleChange}
    />
  );
};

const forwaredSeedInput = React.forwardRef(NumericInput);

export default forwaredSeedInput;
