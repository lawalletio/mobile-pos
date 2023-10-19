/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import {useNavigate} from '../../hooks';
import {
  Button,
  Container,
  AutoFlex,
  ScreenView,
  Header,
  Flex,
  Divider,
  CustomText,
  InputValue,
} from '../../ui';
import {AmountKeyboard} from '../../components';

export default function TransferAmmountScreen() {
  const {navigate} = useNavigate();

  return (
    <ScreenView>
      <Header title="Enviar" />
      <Divider y={16} />
      <AutoFlex style={{justifyContent: 'center'}}>
        <Container>
          <Flex>
            <Button
              title="MAX"
              color="secondary"
              type="bezeled"
              onPress={() => null}
            />
            <InputValue placeholder="0" onChange={() => null} />
          </Flex>
          <Divider y={8} />
          <Flex justify="center">
            <CustomText>Disponible:</CustomText>
            <CustomText fontWeight="bold">$ 1.734,50</CustomText>
          </Flex>
        </Container>
      </AutoFlex>
      <Divider y={8} />
      <Container>
        <AmountKeyboard onKeypressed={() => null} />
        <Divider y={16} />
        <Flex direction="column">
          <Button
            isBlock
            title="Continuar"
            color="secondary"
            onPress={() => navigate('TransferSummary')}
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
