import {ColorSchemeName, useColorScheme} from 'react-native';

import {Colors} from '../settings/Colors';

const useColors = () => {
  const deviceTheme: ColorSchemeName = useColorScheme();

  if (deviceTheme === 'light') {
    return Colors.light;
  } else {
    return Colors.dark;
  }
};

export default useColors;
