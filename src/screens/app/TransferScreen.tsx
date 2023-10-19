/* eslint-disable react-native/no-inline-styles */
import React from 'react';
// import {FontAwesome5} from '@expo/vector-icons';

import {useNavigate, useColors} from '../../hooks';
import {
  Button,
  Container,
  AutoFlex,
  ScreenView,
  Header,
  Input,
  Flex,
  Divider,
  CustomText,
  Card,
  Heading,
} from '../../ui';
import {View} from 'react-native';

// POC
const tokens = [
  {
    name: 'eth',
    price: '1.234,50',
    amount: '0.0123',
  },
  {
    name: 'dai',
    price: '500',
    amount: '500',
  },
];

export default function TransferScreen() {
  const {navigate} = useNavigate();
  const colorScheme = useColors();

  return (
    <ScreenView>
      <Header title="Enviar" />
      <Divider y={16} />
      <AutoFlex>
        <Container>
          <Flex>
            <Input placeholder="Billetera" withButton onChange={() => null} />
            <Button type="bezeled" onPress={() => null}>
              {/* <FontAwesome5
                name="qrcode"
                size={20}
                color={colorScheme.primary}
              /> */}
            </Button>
          </Flex>
          <Divider y={8} />
          <Container>
            <CustomText align="center" opacity={65}>
              Recuerda siempre verificar a quien le envias dinero.
            </CustomText>
          </Container>
          <Divider y={16} />
          <Heading type="h6">Que deseas enviar?</Heading>
          <Divider y={8} />
          <Flex direction="column" gap={4}>
            {tokens.map((token, index) => (
              <Card borderRadius={8} key={index}>
                <Flex justify="spaceBetween" align="center">
                  <Flex justify="spaceBetween" align="center" isFlex>
                    <Flex align="center">
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 999,
                          backgroundColor: colorScheme.text,
                        }}
                      />
                      <CustomText>{token?.name.toLocaleUpperCase()}</CustomText>
                    </Flex>
                    <Flex direction="column" align="end" gap={0}>
                      <CustomText fontWeight="bold">
                        $ {token?.price}
                      </CustomText>
                      <CustomText opacity={65}>{token?.amount}</CustomText>
                    </Flex>
                  </Flex>
                  <Divider x={8} />
                  {/* <FontAwesome5
                    name="angle-right"
                    size={20}
                    color={colorScheme.primary}
                  /> */}
                </Flex>
              </Card>
            ))}
          </Flex>
        </Container>
      </AutoFlex>
      <Container>
        <Flex direction="column">
          <Button
            isBlock
            title="Continuar"
            color="secondary"
            onPress={() => navigate('TransferAmmount')}
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
