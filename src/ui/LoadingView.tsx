/* eslint-disable react-native/no-inline-styles */
import {ActivityIndicator} from 'react-native';
import React from 'react';
import Container from './Container';

const LoadingView = () => {
  return (
    <Container style={{flex: 1, flexDirection: 'row', alignSelf: 'center'}}>
      <ActivityIndicator />
    </Container>
  );
};

export default LoadingView;
