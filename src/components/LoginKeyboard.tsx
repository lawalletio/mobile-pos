import React from 'react';

import Keyboard from '../ui/Keyboard';

interface LoginKeyboardProps {
  onKeypressed: (value: string) => void;
}

const LoginKeyboard: React.FunctionComponent<LoginKeyboardProps> = ({
  onKeypressed,
}) => {
  return <Keyboard onPress={onKeypressed} type="login" />;
};

export default LoginKeyboard;
