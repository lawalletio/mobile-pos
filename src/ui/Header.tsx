import React, {PropsWithChildren} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';

import {useColors, useNavigate} from '../hooks';

import Flex from './Flex';
import Heading from './Heading';
import Button from './Button';
import Container from './Container';
import AutoFlex from './AutoFlex';

interface HeaderProps {
  title: string;
  style?: ViewStyle;
  showButtonBack?: boolean;
}

const Header: React.FunctionComponent<PropsWithChildren<HeaderProps>> = ({
  title,
  style,
  showButtonBack = false,
}) => {
  const colorScheme = useColors();
  const {navigate} = useNavigate();

  const styles = StyleSheet.create({
    base: {
      ...style,

      width: '100%',
      height: 50,
      justifyContent: 'center',

      backgroundColor: colorScheme.background,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme.gray15,
    },
  });

  return (
    <View style={styles.base}>
      <Container>
        <Flex justify="center" align="center">
          <AutoFlex>
            <Heading type="h5">{title}</Heading>
          </AutoFlex>
          {showButtonBack && (
            <Button
              title="Cancelar"
              size="small"
              type="borderless"
              onPress={() => navigate('Dashboard')}
            />
          )}
        </Flex>
      </Container>
    </View>
  );
};

export default Header;
