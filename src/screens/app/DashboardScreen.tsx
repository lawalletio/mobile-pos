/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  InputValue,
  Header,
  Heading,
} from '../../ui';
import {AmountKeyboard} from '../../components';

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
      <Header title="Generar importe" />
      <AutoFlex>
        <AutoFlex style={{justifyContent: 'center'}}>
          <Container>
            <Flex justify="center">
              <Heading>$ 500.00</Heading>
            </Flex>
            <Divider y={8} />
            <Flex justify="center">
              <Button
                size="small"
                title="SAT"
                type="borderless"
                onPress={() => null}
              />
              <Button
                size="small"
                title="USD"
                type="bezeled"
                onPress={() => null}
              />
              <Button
                size="small"
                title="ARS"
                type="borderless"
                onPress={() => null}
              />
            </Flex>
            {/* <Flex justify="center">
              <CustomText>Disponible:</CustomText>
              <CustomText>$ 1.734,50</CustomText>
            </Flex> */}
          </Container>
        </AutoFlex>
        <Container>
          <Flex>
            {/* <AutoFlex>
              <Button
                title="Cancelar"
                type="bezeled"
                onPress={() => navigate('Dashboard')}
              />
            </AutoFlex> */}
            <AutoFlex>
              <Button
                title="Continuar"
                color="secondary"
                onPress={() => navigate('Receive')}
              />
            </AutoFlex>
          </Flex>
          <Divider y={16} />
          <AmountKeyboard onKeypressed={() => null} />
          <Divider y={16} />
        </Container>
      </AutoFlex>
    </ScreenView>
  );
}
