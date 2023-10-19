/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {PixelRatio, StyleSheet, Text as RNText} from 'react-native';

// import ExpoCheckbox from 'expo-checkbox';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FunctionComponent<CheckboxProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <RNText>Check</RNText>
    // <ExpoCheckbox
    //   style={{
    //     borderColor: 'white',
    //     backgroundColor: 'white',
    //     borderRadius: 4,
    //   }}
    //   value={value}
    //   onValueChange={onValueChange}
    //   disabled={disabled}
    // />
  );
};

export default Checkbox;
