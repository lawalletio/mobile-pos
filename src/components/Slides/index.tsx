import React, {ReactElement, useRef, useState} from 'react';
import {Animated, FlatList, View, ViewStyle} from 'react-native';

import Pagination from './Pagination';

interface SlidesProps {
  data: any[];
  renderItem: (item: any) => ReactElement;
  containerStyles?: ViewStyle;
}

const Slides: React.FunctionComponent<SlidesProps> = ({
  data,
  renderItem,
  containerStyles,
}) => {
  const [index, setIndex] = useState<number>(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const handleScroll = (event: any) => {
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              x: scrollX,
            },
          },
        },
      ],
      {useNativeDriver: false},
    )(event);
  };

  const handleOnViewableItemsChanged = useRef(({viewableItems}: any) => {
    setIndex(viewableItems[0].index);
  }).current;

  return (
    <View style={containerStyles}>
      <FlatList
        bounces={false}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        onScroll={handleScroll}
        keyExtractor={(item, idx) => `${item}${idx}`}
        onViewableItemsChanged={handleOnViewableItemsChanged}
      />
      <Pagination data={data} scrollX={scrollX} visibleIndex={index} />
    </View>
  );
};

export default Slides;
