import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {useNavigate} from '../../hooks';
import {SeedPhraseForm} from '../../components';
import {
  Button,
  CustomText,
  Divider,
  Heading,
  ScreenView,
  Flex,
  Container,
} from '../../ui';

export default function CheckSeedScreen() {
  const {dispatch, goBack} = useNavigate();
  const [seedFormValue, setSeedFormValue] = useState<any[]>([]);

  const handleSubmit = async () => {
    if (seedFormValue.length === 12) {
      const phrase = await AsyncStorage?.getItem('phrase');
      if (phrase && phrase === seedFormValue.join(' ')) {
        await AsyncStorage.setItem('securityChecked', 'true');
        dispatch('CheckSeedSuccess');
      }
    }
  };
  return (
    <ScreenView>
      <Container style={styles.container}>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Heading>Check</Heading>
            <Divider y={5} />
            <CustomText>
              Si bien toda informacion queda almacenada en su dispotivo,
              necesita un metodo de seguridad minimo para retirar fondos.
            </CustomText>
            <Divider y={20} />
            <SeedPhraseForm setFormValue={setSeedFormValue} />
            <Divider y={20} />
          </View>
        </KeyboardAwareScrollView>

        <Flex direction="column">
          <Button
            isBlock
            color="primary"
            title="Continuar"
            onPress={handleSubmit}
          />

          <Button
            isBlock
            type="bezeledGray"
            title="Cancelar"
            onPress={goBack}
          />
        </Flex>
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
