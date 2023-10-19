import React from 'react';
import {StyleSheet} from 'react-native';

import {useNavigate} from '../../hooks';
import {
  Button,
  Container,
  CustomText,
  Flex,
  Heading,
  ScreenView,
} from '../../ui';

export default function CheckSeedSuccessScreen() {
  const {navigate} = useNavigate();

  // React.useEffect(
  //   () =>
  //     navigation.addListener('beforeRemove', (e: any) => {
  //       console.log(2)
  //       // navigate('Dashboard')
  //       e.preventDefault()
  //     }),
  //   [navigation],
  // )

  const onGoToDashboard = () => {
    navigate('Dashboard');
  };

  return (
    <ScreenView>
      <Container style={styles.container}>
        <Flex isFlex direction="column" align="center" justify="center">
          <Heading align="center">Congratulations!</Heading>
          <CustomText align="center">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </CustomText>
        </Flex>

        <Flex direction="column">
          {/* <Button type='bezeled' isBlock onPress={onGoToDashboard} title='Descargar guia' /> */}
          <Button
            type="bezeledGray"
            isBlock
            onPress={onGoToDashboard}
            title="Ir al inicio"
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
