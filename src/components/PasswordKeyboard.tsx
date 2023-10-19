import React from 'react';

import Keyboard from '../ui/Keyboard';

interface PasswordKeyboardProps {
  onKeypressed: (value: string) => void;
}

const PasswordKeyboard: React.FunctionComponent<PasswordKeyboardProps> = ({
  onKeypressed,
}) => {
  const handlePressKey = (key: string) => {
    onKeypressed(key);
  };
  return <Keyboard type="password" onPress={handlePressKey} />;
};

export default PasswordKeyboard;
