import {useWindowDimensions} from 'react-native';

const useDeviceDimensions = () => {
  const {height, width} = useWindowDimensions();
  const isDeviceSmall: boolean = height <= 650;

  return {
    height,
    width,
    isDeviceSmall,
  };
};

export default useDeviceDimensions;
