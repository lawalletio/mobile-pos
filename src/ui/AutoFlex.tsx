import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';

interface AutoFlexProps {
  children: any;
  style?: any;
}

const AutoFlex: React.FunctionComponent<PropsWithChildren<AutoFlexProps>> = ({
  children,
  style,
}) => {
  const styles = StyleSheet.create({
    base: {
      flex: 1,
      ...style,
    },
  });

  return <View style={styles.base}>{children}</View>;
};

export default AutoFlex;
