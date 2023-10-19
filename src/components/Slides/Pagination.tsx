import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  useColorScheme,
  ColorSchemeName,
} from 'react-native';
import {useDeviceDimensions} from '../../hooks';

interface PaginationProps {
  data: any[];
  scrollX: any;
  visibleIndex: number;
}

const Pagination: React.FunctionComponent<PaginationProps> = ({
  data,
  scrollX,
  visibleIndex,
}) => {
  const {width} = useDeviceDimensions();
  const deviceTheme: ColorSchemeName = useColorScheme();
  return (
    <View style={styles.container}>
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [12, 30, 12],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                backgroundColor:
                  index === visibleIndex
                    ? deviceTheme === 'light'
                      ? 'white'
                      : 'black'
                    : deviceTheme === 'light'
                    ? 'black'
                    : 'white',
              },
            ]}
          />
        );
      })}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  container: {
    bottom: 50,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginHorizontal: 3,
    backgroundColor: '#ccc',
  },
});
