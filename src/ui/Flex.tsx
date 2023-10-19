import React, {PropsWithChildren} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';

interface FlexProps {
  direction?: 'row' | 'column';
  gap?: 0 | 2 | 4 | 8 | 12 | 16;
  justify?: 'start' | 'end' | 'spaceBetween' | 'center';
  align?: 'start' | 'end' | 'center';
  style?: ViewStyle;
  fullWidth?: boolean;
  isFlex?: boolean;
}

const Flex: React.FunctionComponent<PropsWithChildren<FlexProps>> = ({
  direction = 'row',
  gap = 8,
  justify = 'start',
  align = 'start',
  children,
  style,
  fullWidth = false,
  isFlex = false,
}) => {
  const styles = StyleSheet.create({
    base: {
      ...style,
      width: fullWidth ? '100%' : undefined,
      flex: isFlex ? 1 : 0,
    },
    // flexDirection
    row: {
      flexDirection: 'row',
    },
    column: {
      flexDirection: 'column',
    },
    // justifyContent
    startJustify: {
      justifyContent: 'flex-start',
    },
    endJustify: {
      justifyContent: 'flex-end',
    },
    spaceBetweenJustify: {
      justifyContent: 'space-between',
    },
    centerJustify: {
      justifyContent: 'center',
    },
    // alignItems
    startAlign: {
      alignItems: 'flex-start',
    },
    endAlign: {
      alignItems: 'flex-end',
    },
    centerAlign: {
      alignItems: 'center',
    },
    // gap
    0: {
      gap: 0,
    },
    2: {
      gap: 2,
    },
    4: {
      gap: 4,
    },
    8: {
      gap: 8,
    },
    12: {
      gap: 12,
    },
    16: {
      gap: 16,
    },
  });

  return (
    <View
      style={[
        styles.base,
        styles[direction],
        styles[gap],
        styles[`${justify}Justify`],
        styles[`${align}Align`],
      ]}>
      {children}
    </View>
  );
};

export default Flex;
