/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';

import {CreatePassword, ValidatePassword} from '../../features/components';
import {PasswordKeyboard} from '../../components';
import {ScreenView, Container, Divider} from '../../ui';

import {
  addElementoToPassword,
  removeElementoToPassword,
} from '../../utils/passwordArrayMethods';

export type PasswodCamp = {
  value?: number;
};

export type Password = [
  PasswodCamp,
  PasswodCamp,
  PasswodCamp,
  PasswodCamp,
  PasswodCamp,
  PasswodCamp,
];

export default function PasswordScreen() {
  const [password, setPassword] = useState<(string | null)[]>(
    new Array(6).fill(null),
  );
  const [validatePassword, setValidatePassword] = useState<(string | null)[]>(
    new Array(6).fill(null),
  );
  const [creationStep, setCreationStep] = useState<'create' | 'validate'>(
    'create',
  );

  const onSubmit = useCallback(async () => {
    // setLoading(true);
    // setCreationStep('create');
    // setValidatePassword(new Array(6).fill(null));
    // try {
    //   const wallet = await createEthereumWallet();
    //   if (wallet) {
    //     await AsyncStorage.setItem('phrase', wallet.phrase);
    //     await AsyncStorage.setItem('localPassword', password.join(''));
    //     dispatch('AppStack');
    //   }
    // } catch (error: any) {
    //   setPassword(new Array(6).fill(null));
    // } finally {
    //   setLoading(false);
    // }
  }, []);

  useEffect(() => {
    if (password.filter(el => el).length === 6) {
      setCreationStep('validate');
    }
    if (
      creationStep === 'validate' &&
      JSON.stringify(password) === JSON.stringify(validatePassword)
    ) {
      onSubmit();
    } else if (
      creationStep === 'validate' &&
      password.filter(el => el).length === 6 &&
      validatePassword.filter(el => el).length === 6 &&
      JSON.stringify(password) !== JSON.stringify(validatePassword)
    ) {
      setCreationStep('create');
      setPassword(new Array(6).fill(null));
      setValidatePassword(new Array(6).fill(null));
    }
  }, [password, validatePassword, creationStep, onSubmit]);

  const handleKeypressed = (keyValue: string) => {
    if (creationStep === 'create') {
      const tempCreatePass = password;
      let newElement = tempCreatePass;
      if (keyValue === 'clean') {
        newElement = removeElementoToPassword(tempCreatePass, null);
      } else {
        newElement = addElementoToPassword(tempCreatePass, keyValue);
      }

      setPassword([...newElement]);
    } else {
      const tempValidatePass = validatePassword;
      let newElement = tempValidatePass;
      if (keyValue === 'clean') {
        newElement = removeElementoToPassword(tempValidatePass, null);
      } else {
        newElement = addElementoToPassword(tempValidatePass, keyValue);
      }
      setValidatePassword([...newElement]);
    }
  };

  return (
    <ScreenView>
      <>
        <Container style={{flex: 1}}>
          {creationStep === 'create' ? (
            <CreatePassword value={password} />
          ) : (
            <ValidatePassword value={validatePassword} />
          )}
        </Container>
        <Divider y={16} />
        <Container>
          <PasswordKeyboard onKeypressed={handleKeypressed} />
        </Container>
      </>
    </ScreenView>
  );
}
