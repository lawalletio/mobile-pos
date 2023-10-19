import React from 'react';
import {StyleSheet, TextInput, View, PixelRatio} from 'react-native';

import Button from './Button';
import {useColors, useDeviceDimensions} from '../hooks';

interface InputProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  // POC
  withButton?: boolean;
}

const Input = (
  {value, onChange, placeholder = '', withButton = false}: InputProps,
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
      gap: 8,

      paddingHorizontal: 16,
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
    input: {
      flex: 1,
      color: colors.text,
      fontSize: getFontSize(16),
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
      <TextInput
        ref={ref}
        placeholder={placeholder}
        value={value}
        style={styles.input}
        returnKeyType="next"
        secureTextEntry
        onChangeText={handleChange}
      />
      {withButton && (
        <View>
          <Button
            title="Button"
            size="small"
            type="bezeled"
            onPress={() => null}
          />
        </View>
      )}
    </View>
  );
};

const forwaredSeedInput = React.forwardRef(Input);

export default forwaredSeedInput;
