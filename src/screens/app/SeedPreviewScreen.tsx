import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useNavigate} from '../../hooks';
import {SeedPhrasePreview} from '../../components';
import {
  Button,
  CheckCard,
  Container,
  CustomText,
  Divider,
  Flex,
  Heading,
  ScreenView,
} from '../../ui';

export default function SeedPreviewScreen() {
  const {navigate} = useNavigate();

  const [seedPhrase, setSeedPhrase] = useState<any>([]);
  const [toggleCheckBox, setToggleCheckBox] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const phraseStr = await AsyncStorage.getItem('phrase');
      if (phraseStr) {
        const phrase = phraseStr.split(' ');
        setSeedPhrase(phrase);
      }
    })();
  }, []);

  const onAcceptBtn = () => toggleCheckBox && navigate('CheckSeed');

  const onCancelBtn = () => navigate('Dashboard');

  return (
    <ScreenView>
      <Container style={styles.container}>
        <View>
          <Heading>Anota tu frase semilla</Heading>
          <Divider y={5} />
          <CustomText>
            Si bien toda informacion queda almacenada en su dispotivo, necesita
            un metodo de seguridad minimo para retirar fondos.
          </CustomText>
          <Divider y={20} />
          <SeedPhrasePreview phraseList={seedPhrase} />
        </View>

        <Flex direction="column">
          <CheckCard value={toggleCheckBox} onValueChange={setToggleCheckBox} />
          <Button
            isBlock
            color="primary"
            title="Continuar"
            onPress={onAcceptBtn}
          />

          <Button
            isBlock
            type="bezeledGray"
            title="Cancelar"
            onPress={onCancelBtn}
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
