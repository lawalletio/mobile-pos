import React from 'react';
import {StyleSheet, View} from 'react-native';

import {AutoFlex, CustomText, Flex, Heading, PasswordPoint} from '../../ui';

interface CreatePasswordProps {
  value: (string | null)[];
}

const CreatePassword: React.FunctionComponent<CreatePasswordProps> = ({
  value,
}) => {
  return (
    <AutoFlex>
      <Flex direction="column">
        <Heading>Crear password</Heading>
        <CustomText>
          Crea una contraseña para poder acceder a tu cuenta.
        </CustomText>
      </Flex>
      <View style={styles.box}>
        <Flex align="center" justify="center">
          {value.map((el, index) => (
            <PasswordPoint key={index} active={!!el} />
          ))}
        </Flex>
      </View>
    </AutoFlex>
  );
};

export default CreatePassword;

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
