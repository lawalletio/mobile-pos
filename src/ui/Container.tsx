import React, {PropsWithChildren} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';

interface ContainerProps {
  fullWith?: boolean;
  style?: ViewStyle;
}

const Container: React.FunctionComponent<PropsWithChildren<ContainerProps>> = ({
  children,
  fullWith = false,
  style,
}) => {
  const styles = StyleSheet.create({
    base: {
      position: 'relative',
      paddingHorizontal: fullWith ? 0 : '4%',
      ...style,
    },
  });

  return <View style={styles.base}>{children}</View>;
};

export default Container;
