/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';

import {useNavigate, useColors} from '../../hooks';
import {
  Button,
  Container,
  AutoFlex,
  ScreenView,
  Header,
  Flex,
  Divider,
  CustomText,
} from '../../ui';

export default function TransferSummaryScreen() {
  const {navigate} = useNavigate();
  const colorScheme = useColors();

  return (
    <ScreenView>
      <Header title="Enviar" />
      <Divider y={16} />
      <AutoFlex style={{justifyContent: 'flex-end'}}>
        <Container>
          <Flex direction="column" gap={16}>
            <Flex justify="spaceBetween" fullWidth>
              <Flex direction="column" gap={0}>
                <CustomText size="small" opacity={65}>
                  Billetera
                </CustomText>
                <CustomText fontWeight="bold">0xEC8...b73a</CustomText>
              </Flex>
              <Button
                title="Cambiar"
                size="small"
                type="bezeled"
                onPress={() => null}
              />
            </Flex>
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: colorScheme.gray15,
              }}
            />
            <Flex fullWidth justify="spaceBetween">
              <CustomText opacity={65}>Monto</CustomText>
              <CustomText>$ 500,00</CustomText>
            </Flex>
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: colorScheme.gray15,
              }}
            />
            <Flex fullWidth justify="spaceBetween">
              <CustomText opacity={65}>Comision</CustomText>
              <CustomText>$ 0,01</CustomText>
            </Flex>
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: colorScheme.gray15,
              }}
            />
            <Flex fullWidth justify="spaceBetween">
              <CustomText fontWeight="bold">Total</CustomText>
              <CustomText fontWeight="bold">$ 500,01</CustomText>
            </Flex>
          </Flex>
        </Container>
      </AutoFlex>
      <Container>
        <Divider y={16} />
        <Flex direction="column">
          <Button
            isBlock
            title="Transferir"
            color="secondary"
            onPress={() => navigate('TransferSuccess')}
          />
          <Button
            isBlock
            title="Cancelar"
            type="bezeled"
            onPress={() => navigate('Dashboard')}
          />
        </Flex>
      </Container>
      <Divider y={8} />
    </ScreenView>
  );
}
