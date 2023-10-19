import React from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SeedPhraseForm} from '../../components';

import {useNavigate} from '../../hooks';
import {
  Button,
  CustomText,
  Divider,
  Heading,
  ScreenView,
  Flex,
  Container,
} from '../../ui';

export default function SignupScreen() {
  const {goBack} = useNavigate();
  return (
    <ScreenView>
      <Container style={styles.container}>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Heading>Frase semilla</Heading>
            <Divider y={5} />
            <CustomText>
              Si bien toda informacion queda almacenada en su dispotivo,
              necesita un metodo de seguridad minimo para retirar fondos.
            </CustomText>
            <Divider y={20} />
            <SeedPhraseForm setFormValue={() => null} />
            <Divider y={20} />
          </View>

          <Flex direction="column">
            <Button
              isBlock
              color="primary"
              title="Continuar"
              onPress={() => Alert.alert('Error')}
            />

            <Button
              isBlock
              type="bezeledGray"
              title="Cancelar"
              onPress={goBack}
            />
          </Flex>
        </KeyboardAwareScrollView>
      </Container>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    height: '100%',
  },
  buttonsContainer: {
    gap: 8,
  },
});
