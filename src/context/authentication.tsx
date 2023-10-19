import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

type AuthenticationContext = {
  logued: boolean;
  logIn: () => void;
  logOut: () => void;
};

const AuthenticationContext = createContext<AuthenticationContext>({
  logued: false,
  logIn: () => null,
  logOut: () => null,
});

const AuthenticationProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [logued, setLogued] = useState<boolean>(true);

  // useEffect(() => {
  //   (async () => {
  //     const isLogued = await AsyncStorage.getItem('account');
  //     if (isLogued === 'true') {
  //       setLogued(true);
  //     }
  //   })();
  // }, []);

  const logOut = () => {
    setLogued(false);
  };

  const logIn = () => {
    setLogued(true);
  };

  return (
    <AuthenticationContext.Provider value={{logued, logOut, logIn}}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationProvider;

export function useAuthentication() {
  return useContext(AuthenticationContext);
}
