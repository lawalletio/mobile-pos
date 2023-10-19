import React from 'react';
import {StyleSheet, View} from 'react-native';

import {useColors} from '../hooks';

interface PasswordPoint {
  active?: boolean;
}

const PasswordPoint = ({active}: PasswordPoint) => {
  const colors = useColors();
  const styles = StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 35,
      height: 35,

      backgroundColor: active ? colors.primary : 'transparent',
      borderRadius: 8,
    },
    circle: {
      width: 10,
      height: 10,

      backgroundColor: active ? colors.background : colors.gray35,
      borderRadius: 999,
    },
  });

  return (
    <View style={[styles.base]}>
      <View style={[styles.circle]} />
    </View>
  );
};

const forwaredPasswordPoint = React.forwardRef(PasswordPoint);

export default forwaredPasswordPoint;
