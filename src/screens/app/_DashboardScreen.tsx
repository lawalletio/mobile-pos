/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useColors, useNavigate} from '../../hooks';
import {
  Flex,
  Container,
  CustomText,
  ButtonCircle,
  ScreenView,
  Divider,
  Card,
  AutoFlex,
  Button,
} from '../../ui';

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

export default function DashboardScreen() {
  const colorScheme = useColors();
  const {navigate} = useNavigate();
  const [securityChecked, setSecurityChecked] = useState<boolean>(false);

  const styles = StyleSheet.create({
    value: {
      color: colorScheme.text,
      fontSize: 32,
      fontWeight: 'bold',
    },
  });

  useEffect(() => {
    (async () => {
      const isSecurityChecked = await AsyncStorage.getItem('securityChecked');
      if (isSecurityChecked) {
        setSecurityChecked(true);
      }
    })();
  }, []);

  const onSecurityOnboarding = () => {
    navigate('SecurityOnboarding');
  };

  return (
    <ScreenView>
      <AutoFlex>
        <Container style={{flex: 1}}>
          <AutoFlex style={{justifyContent: 'center'}}>
            <Flex direction="column" align="center" gap={4}>
              <CustomText opacity={65}>Balance</CustomText>
              <Text style={styles.value}>$734,59</Text>
            </Flex>
            <Divider y={22} />
            <Flex justify="center" gap={16}>
              <ButtonCircle
                title="Enviar"
                color="secondary"
                onPress={() => navigate('Transfer')}
              />
              <Divider x={8} />
              <ButtonCircle
                title="Recibir"
                onPress={() => navigate('Receive')}
              />
            </Flex>
          </AutoFlex>
          <Flex direction="column" gap={2}>
            {tokens.map((token, index) => (
              <Card borderRadius={4} key={index}>
                <Flex justify="spaceBetween" align="center">
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
                    <CustomText fontWeight="bold">$ {token?.price}</CustomText>
                    <CustomText opacity={65}>{token?.amount}</CustomText>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        </Container>
      </AutoFlex>
      {!securityChecked && (
        <>
          <Divider y={8} />
          <Container
            fullWith
            style={{backgroundColor: `${colorScheme.terciary}26`}}>
            <View style={{paddingHorizontal: 16, paddingVertical: 22}}>
              <Flex direction="column" align="center" gap={16}>
                <CustomText align="center">
                  Respalda tu billetera para resguardar los fondos.
                </CustomText>
                <Button
                  title="Copia de seguridad"
                  color="terciary"
                  isBlock
                  onPress={onSecurityOnboarding}
                />
              </Flex>
            </View>
          </Container>
        </>
      )}
    </ScreenView>
  );
}
