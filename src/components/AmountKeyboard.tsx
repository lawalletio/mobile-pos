import React from 'react';

import Keyboard from '../ui/Keyboard';

interface AmountKeyboardProps {
  onKeypressed: (value: string) => void;
}

const AmountKeyboard: React.FunctionComponent<AmountKeyboardProps> = ({
  onKeypressed,
}) => {
  const handlePressKey = (key: string) => {
    console.log('🚀 ~ file: AmountKeyboard.tsx:7 ~ handlePressKey ~ key:', key);
    onKeypressed(key);
  };
  return <Keyboard type="value" onPress={handlePressKey} />;
};

export default AmountKeyboard;
