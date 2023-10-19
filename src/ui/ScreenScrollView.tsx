/* eslint-disable react-native/no-inline-styles */
import React, {PropsWithChildren} from 'react';
import {ScrollView, View, ViewStyle} from 'react-native';

import {useColors} from '../hooks';
import ScreenView from './ScreenView';

interface ScreenScrollView {
  styles?: ViewStyle;
}

const ScreenScrollView: React.FunctionComponent<
  PropsWithChildren<ScreenScrollView>
> = ({children, styles}) => {
  const color = useColors();
  return (
    <ScreenView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={{
          backgroundColor: color.background,
        }}>
        <View
          style={{
            paddingHorizontal: '4%',
            paddingVertical: '2%',
            flex: 1,
            ...styles,
          }}>
          {children}
        </View>
      </ScrollView>
    </ScreenView>
  );
};

export default ScreenScrollView;
