/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
// import {FontAwesome5} from '@expo/vector-icons';

import {useNavigate, useColors} from '../../hooks';
import {
  AutoFlex,
  Container,
  CustomText,
  Heading,
  ScreenView,
  Flex,
  Button,
  Divider,
} from '../../ui';

export default function TransferSuccessScreen() {
  const {navigate} = useNavigate();
  const colorScheme = useColors();

  return (
    <ScreenView>
      <AutoFlex style={{justifyContent: 'center', paddingHorizontal: '8%'}}>
        <Container style={{position: 'relative', zIndex: 2}}>
          <Flex direction="column" align="center">
            {/* <FontAwesome5 name="check" size={32} color={colorScheme.primary} /> */}
            <Divider y={8} />
            <Heading type="h4" align="center">
              ¡Transferencia enviada!
            </Heading>
            <CustomText align="center">
              Las transferencias suelen durar entre 5 a 15 minutos.
            </CustomText>
          </Flex>
          <Divider y={16} />
          <Flex direction="column" align="center" gap={0}>
            <CustomText size="small">Total</CustomText>
            <CustomText fontWeight="bold">$ 500,01</CustomText>
          </Flex>
        </Container>
      </AutoFlex>

      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={{
            width: 30,
            height: 30,
            backgroundColor: colorScheme.background,
            borderRadius: 999,
          }}
        />
        <View
          style={{flex: 1, height: 2, backgroundColor: colorScheme.background}}
        />
        <View
          style={{
            width: 30,
            height: 30,
            backgroundColor: colorScheme.background,
            borderRadius: 999,
          }}
        />
      </View>

      <Divider y={16} />

      <View style={{paddingHorizontal: '4%'}}>
        <Container style={{position: 'relative', zIndex: 2}}>
          <Flex direction="column" gap={8}>
            <Flex justify="spaceBetween" fullWidth>
              <Flex direction="column" gap={0}>
                <CustomText size="small" opacity={65}>
                  Identificador
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
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: colorScheme.gray5,
              }}
            />
            <Flex justify="spaceBetween" fullWidth>
              <Flex direction="column" gap={0}>
                <CustomText size="small" opacity={65}>
                  Billetera
                </CustomText>
                <CustomText fontWeight="bold">0xEC8...b73a</CustomText>
              </Flex>
              <Button
                title="Agregar"
                size="small"
                type="bezeled"
                onPress={() => null}
              />
            </Flex>
            <Divider y={12} />
            <Button
              title="Finalizar"
              isBlock
              onPress={() => navigate('Dashboard')}
            />
            <Divider y={12} />
          </Flex>
        </Container>
      </View>
      <View
        style={{
          position: 'absolute',
          zIndex: -1,
          height: '100%',
          width: '100%',
          flex: 1,
          paddingHorizontal: '4%',
          paddingTop: 20,
          paddingBottom: 20,
        }}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colorScheme.gray5,
            borderRadius: 8,
          }}
        />
      </View>
    </ScreenView>
  );
}
