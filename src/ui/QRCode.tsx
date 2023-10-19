import React from 'react';
import {StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {useColors} from '../hooks';

interface ComponentProps {
  value: string;
}

const Component: React.FunctionComponent<ComponentProps> = ({value}) => {
  const colorScheme = useColors();

  const styles = StyleSheet.create({
    box: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      paddingVertical: 24,

      backgroundColor: colorScheme.white,
      // borderRadius: 24,
    },
    base: {
      // height: '100%',
      // minHeight: 100,
    },
  });

  return (
    <View style={styles.box}>
      <QRCode value={value} size={150} />
    </View>
  );
};

export default Component;
