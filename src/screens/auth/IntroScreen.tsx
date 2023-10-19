/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useAuthentication} from '../../context/authentication';

import {useNavigate} from '../../hooks';
import {
  Button,
  CustomText,
  Divider,
  Heading,
  ScreenView,
  Flex,
  Container,
  Logo,
} from '../../ui';

export default function IntroScreen() {
  const {navigate} = useNavigate();
  // const {logIn} = useAuthentication();

  const onCreate = () => {
    navigate('SignupPassword');
  };

  const onLogIn = () => {
    // logIn();
  };

  return (
    <ScreenView styles={styles.container}>
      <Container>
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
            }}>
            <View style={{width: 220, height: 80}}>
              <Logo />
            </View>
          </View>
          <View>
            <Divider y={20} />
            <Heading align="center">
              Aceptar cripto nunca fue tan fácil.
            </Heading>
            <Divider y={10} />
            <CustomText align="center">
              Ten el{' '}
              <CustomText fontWeight="bold">
                control total de tus finanzas
              </CustomText>
              . Wallet non-custodial para Ethereum..
            </CustomText>
            <Divider y={20} />
            <Flex direction="column">
              <Button isBlock onPress={onCreate} title="Crear" />

              <Button
                isBlock
                onPress={onLogIn}
                type="bezeled"
                title="Ingresar"
              />
            </Flex>
          </View>
        </View>
      </Container>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
});
