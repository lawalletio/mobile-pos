/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TouchableOpacity} from 'react-native';

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
  Heading,
  Card,
  QRCode,
} from '../../ui';
import {QRIcon, CardIcon} from '../../ui/Icons';

import {useColors, useNavigate} from '../../hooks';

export default function ReceiveScreen() {
  const colorScheme = useColors();
  const {navigate} = useNavigate();

  return (
    <ScreenView>
      <Header showButtonBack={true} title="Cobrar" />
      <AutoFlex>
        <QRCode value="algo" />
      </AutoFlex>
      <Container>
        <Divider y={12} />
        <Flex direction="column" align="center" justify="center" gap={4}>
          <CustomText size="small" opacity={65}>
            Total
          </CustomText>
          <Heading>$ 10.500</Heading>
        </Flex>
        <Divider y={12} />
        <Button
          title="Pago con tarjeta"
          type="bezeled"
          isBlock
          onPress={() => navigate('Dashboard')}
        />
        <Divider y={4} />
        <Button
          title="Cancelar"
          type="bezeledGray"
          isBlock
          onPress={() => navigate('Dashboard')}
        />
      </Container>
      <Divider y={12} />
    </ScreenView>
  );
}
