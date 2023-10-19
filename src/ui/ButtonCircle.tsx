import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
// import {FontAwesome5} from '@expo/vector-icons';

import {useColors} from '../hooks';
import Flex from './Flex';
import CustomText from './CustomText';

interface ButtonCircleProps {
  title: string;
  color?: 'primary' | 'secondary';
  onPress: () => void;
}

const ButtonCircle: React.FunctionComponent<ButtonCircleProps> = ({
  title,
  color = 'primary',
  onPress,
}) => {
  const colorScheme = useColors();

  const isPrimary = color === 'primary';
  const styles = StyleSheet.create({
    box: {
      maxWidth: 90,
    },
    base: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 85,
      minWidth: 85,

      borderRadius: 999,
    },
    primary: {
      backgroundColor: colorScheme.primary,
    },
    secondary: {
      backgroundColor: colorScheme.secondary,
    },
  });

  return (
    <View style={styles.box}>
      <Flex direction="column" align="center">
        <TouchableOpacity
          onPress={onPress}
          style={[styles.base, styles[color]]}>
          {/* Icon */}
          {/* {isPrimary ? (
            <FontAwesome5
              name="arrow-down"
              size={20}
              color={colorScheme.background}
            />
          ) : (
            <FontAwesome5
              name="arrow-up"
              size={20}
              color={colorScheme.background}
            />
          )} */}
        </TouchableOpacity>
        <CustomText size="small" opacity={65}>
          {title}
        </CustomText>
      </Flex>
    </View>
  );
};

export default ButtonCircle;
