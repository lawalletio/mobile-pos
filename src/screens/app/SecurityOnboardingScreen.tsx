/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import {
  ColorSchemeName,
  Image,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  Button,
  Container,
  CustomText,
  Divider,
  Flex,
  Heading,
  ScreenView,
} from '../../ui';
import {useColors, useDeviceDimensions, useNavigate} from '../../hooks';
import {Slides} from '../../components';

export default function SecurityOnboardingScreen() {
  const deviceTheme: ColorSchemeName = useColorScheme();
  const {navigate, goBack} = useNavigate();
  const colors = useColors();
  const {width} = useDeviceDimensions();
  // const battery = require('../../../assets/battery.png');

  const onSeenSeed = () => {
    navigate('SeedPreview');
  };
  const slides = [
    {
      // image: battery,
      title: 'Not your keys, not your coins',
      detail: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. ',
    },
    {
      // image: battery,
      title: 'Not your keys, not your coins 2',
      detail: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. ',
    },
    {
      // image: battery,
      title: 'Not your keys, not your coins 3',
      detail: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. ',
    },
  ];

  return (
    <ScreenView>
      <Slides
        containerStyles={{flex: 2}}
        data={slides}
        renderItem={({item}: any) => {
          return (
            <View
              style={[
                styles.slideItem,
                {width, backgroundColor: colors.primary},
              ]}>
              <Container>
                <Flex justify="center">
                  <Image source={item.image} />
                </Flex>
                <Heading
                  theme={deviceTheme === 'dark' ? 'light' : 'dark'}
                  align="center">
                  {item.title}
                </Heading>
                <Divider y={5} />
                <CustomText
                  theme={deviceTheme === 'dark' ? 'light' : 'dark'}
                  align="center">
                  {item.detail}
                </CustomText>
              </Container>
            </View>
          );
        }}
      />
      <Container style={{paddingVertical: 20}}>
        <Button title="Continuar" onPress={onSeenSeed} />
        <Divider y={5} />
        <Button type="bezeled" title="Mas tarde" onPress={goBack} />
      </Container>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  slideItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
