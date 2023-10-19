/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Pressable} from 'react-native';

import Flex from './Flex';
import Checkbox from './Checkbox';
import CustomText from './CustomText';
import {useColors} from '../hooks';

interface CheckCardProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const CheckCard: React.FunctionComponent<CheckCardProps> = ({
  value,
  onValueChange,
}) => {
  const colors = useColors();

  const togleCheck = () => {
    onValueChange(!value);
  };

  return (
    <Pressable style={{width: '100%'}} onPress={togleCheck}>
      <Flex
        direction="row"
        justify="spaceBetween"
        align="center"
        style={{
          backgroundColor: colors.primary15,
          padding: 15,
          borderRadius: 4,
        }}>
        <Checkbox value={value} onValueChange={onValueChange} />
        <CustomText fontWeight="bold">I have written them</CustomText>
      </Flex>
    </Pressable>
  );
};

export default CheckCard;
