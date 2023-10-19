/* eslint-disable react-native/no-inline-styles */
import React from 'react';
// import QRCode from 'react-native-qrcode-svg'

import {
  Container,
  CustomText,
  ScreenView,
  Flex,
  Button,
  Divider,
  AutoFlex,
  Header,
} from '../../ui';

export default function ReceiveScreen() {
  return (
    <ScreenView>
      <Header title="Recibir" />
      <AutoFlex style={{backgroundColor: '#fff'}}>
        <Flex align="center" justify="center" isFlex>
          {/* <QRCode backgroundColor={'#fff'} value={'0x25392881C6d27d27696CB6c92bd50e62d0Ed29A3'} size={200} /> */}
        </Flex>
      </AutoFlex>
      <Divider y={16} />
      <Container>
        <Flex justify="spaceBetween" fullWidth>
          <Flex direction="column" gap={4}>
            <CustomText size="small" opacity={65}>
              Billetera
            </CustomText>
            <CustomText fontWeight="bold">0xEC8...b73a</CustomText>
          </Flex>
          <Button
            title="Copiar"
            size="small"
            type="bezeled"
            onPress={() => null}
          />
        </Flex>
        <Divider y={8} />
        <CustomText opacity={65} align="center">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </CustomText>
        <Divider y={16} />
        <Button title="Compartir" isBlock onPress={() => null} />
      </Container>
      <Divider y={8} />
    </ScreenView>
  );
}
