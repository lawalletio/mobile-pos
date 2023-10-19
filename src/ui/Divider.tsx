import React from 'react';
import {View} from 'react-native';

interface DividerProps {
  y?: number;
  x?: number;
}

const Divider: React.FunctionComponent<DividerProps> = ({y = 0, x = 0}) => (
  <View style={{marginVertical: y, marginHorizontal: x}} />
);

export default Divider;
