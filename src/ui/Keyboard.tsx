import React from 'react';
// import {TrashIcon} from '@bitcoin-design/bitcoin-icons-react/filled';
// import * as Haptics from 'expo-haptics';
// import {FontAwesome5} from '@expo/vector-icons';

import {useColors} from '../hooks';
import Button from './Button';
import Flex from './Flex';
import AutoFlex from './AutoFlex';
import {TrashIcon} from './Icons';

interface KeyboardProps {
  onPress: (value: string) => any;
  type?: 'password' | 'value' | 'login';
}

const Keyboard = ({onPress, type = 'password'}: KeyboardProps) => {
  const colorScheme = useColors();

  const handlePress = (inputValue: string) => {
    onPress(inputValue);
  };

  const onPressButton = (value: string) => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handlePress(value);
  };

  // const handleLocalAuthentication = (isAuthenticated: boolean) => {
  //   handlePress(isAuthenticated ? 'authSuccess' : 'authFailed');
  // };

  return (
    <Flex direction="column">
      <Flex>
        <AutoFlex>
          <Button
            title="1"
            type="bezeledGray"
            onPress={() => onPressButton('1')}
          />
        </AutoFlex>
        <AutoFlex>
          <Button
            title="2"
            type="bezeledGray"
            onPress={() => onPressButton('2')}
          />
        </AutoFlex>
        <AutoFlex>
          <Button
            title="3"
            type="bezeledGray"
            onPress={() => onPressButton('3')}
          />
        </AutoFlex>
      </Flex>
      <Flex>
        <AutoFlex>
          <Button
            title="4"
            type="bezeledGray"
            onPress={() => onPressButton('4')}
          />
        </AutoFlex>
        <AutoFlex>
          <Button
            title="5"
            type="bezeledGray"
            onPress={() => onPressButton('5')}
          />
        </AutoFlex>
        <AutoFlex>
          <Button
            title="6"
            type="bezeledGray"
            onPress={() => onPressButton('6')}
          />
        </AutoFlex>
      </Flex>
      <Flex>
        <AutoFlex>
          <Button
            title="7"
            type="bezeledGray"
            onPress={() => onPressButton('7')}
          />
        </AutoFlex>
        <AutoFlex>
          <Button
            title="8"
            type="bezeledGray"
            onPress={() => onPressButton('8')}
          />
        </AutoFlex>
        <AutoFlex>
          <Button
            title="9"
            type="bezeledGray"
            onPress={() => onPressButton('9')}
          />
        </AutoFlex>
      </Flex>
      <Flex>
        <AutoFlex>
          {type === 'password' ? (
            <Button
              color="primary"
              type="bezeled"
              onPress={() => onPressButton('clean')}>
              {/* <FontAwesome5
                name="arrow-right"
                size={20}
                color={colorScheme.primary}
              /> */}
            </Button>
          ) : (
            <Button
              title=","
              color="secondary"
              type="bezeled"
              onPress={() => onPressButton(',')}
            />
          )}
        </AutoFlex>
        <AutoFlex>
          <Button
            title="0"
            type="bezeledGray"
            onPress={() => onPressButton('0')}
          />
        </AutoFlex>
        <AutoFlex>
          <Button
            color="terciary"
            type="bezeled"
            onPress={() => onPressButton('clean')}>
            <TrashIcon color={colorScheme.terciary} />
          </Button>
        </AutoFlex>
      </Flex>
    </Flex>
  );
};

// const forwaredSeedKeyboard = React.forwardRef(Keyboard)

export default Keyboard;
