/* eslint-disable react-native/no-inline-styles */
import React, {PropsWithChildren} from 'react';
import {SafeAreaView, View, ViewStyle} from 'react-native';

import {useColors} from '../hooks';

interface ScreenView {
  styles?: ViewStyle;
}

const ScreenView: React.FunctionComponent<PropsWithChildren<ScreenView>> = ({
  children,
  styles,
}) => {
  const color = useColors();
  return (
    <SafeAreaView
      style={{
        backgroundColor: color.background,
        height: '100%',
      }}>
      <View
        style={{
          // paddingVertical: '2%',
          flex: 1,
          ...styles,
        }}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default ScreenView;
