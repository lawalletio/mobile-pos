import React from 'react';
import {StyleSheet, View} from 'react-native';

import {AutoFlex, CustomText, Flex, Heading, PasswordPoint} from '../../ui';

interface ValidatePasswordProps {
  value: (string | null)[];
}

const ValidatePassword: React.FunctionComponent<ValidatePasswordProps> = ({
  value,
}) => {
  return (
    <AutoFlex>
      <Flex direction="column">
        <Heading>Validar password</Heading>
        <CustomText>Valida tu contraseña</CustomText>
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

export default ValidatePassword;

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
