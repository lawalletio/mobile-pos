import React, {useState} from 'react';
import {StyleSheet, TextInput, View, Text, Platform} from 'react-native';

import {useColors} from '../hooks';

interface SeedInput {
  number: number;
  width?: string | number;
  onSubmit?: () => void;
  onChange?: (value: string, index: number) => void;
  value: string;
  disable?: boolean;
}

const SeedInput = (
  {number, width, onSubmit, onChange, value}: SeedInput,
  ref: any,
) => {
  const colors = useColors();
  const [isFocus, setIsFocus] = useState<boolean>(false);

  const onFocus = () => {
    setIsFocus(!isFocus);
  };

  const handleChange = (inputValue: string) => {
    if (!onChange) {
      return null;
    }
    onChange(inputValue.toLowerCase(), number);
  };

  return (
    <View style={[styles.inputContainer, {width}]}>
      <Text
        // eslint-disable-next-line react-native/no-inline-styles
        style={{color: isFocus ? colors.text : colors.gray35, fontSize: 14}}>
        {number}
      </Text>
      <TextInput
        maxFontSizeMultiplier={0}
        maxLength={9}
        autoComplete="off"
        defaultValue={value}
        onChangeText={handleChange}
        ref={ref}
        returnKeyType="next"
        autoCapitalize="none"
        onFocus={onFocus}
        onEndEditing={onFocus}
        keyboardType="default"
        style={[
          styles.input,
          {
            color: colors.text,
            borderBottomColor: isFocus ? colors.primary : colors.lightGray,
          },
        ]}
        onSubmitEditing={onSubmit}
      />
    </View>
  );
};

const forwaredSeedInput = React.forwardRef(SeedInput);

export default forwaredSeedInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
  },
  input: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,

    fontSize: 14,
    textAlign: 'center',
  },
});
