import React from 'react';
import {useColorScheme, Image} from 'react-native';

const Logo = () => {
  const color = useColorScheme();
  const source =
    color === 'light'
      ? require('../../assets/logo-light.png')
      : require('../../assets/logo-dark.png');
  return <Image style={{width: '100%', height: '100%'}} source={source} />;
};

export default Logo;
