import C, { apply } from 'consistencss';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';
import Auth from './Auth';
import Home from './Home';
import SecurityScreen from './SecurityScreen';
import { checkKey, checkSupport, MMKV, UserStatus } from './utils';

const App = () => {
  const [userStatus, setUserStatus] = useState<UserStatus>(UserStatus.Idle);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [keyExists, setKeyExists] = useState<boolean>(false);

  const getUserStatus = async () => {
    const session = await MMKV.getMapAsync('user');

    if (session === null) {
      setUserStatus(UserStatus.NotLogged);
    } else {
      setUserStatus(UserStatus.Logged);
    }
  };

  const onLogin = async (value: object) => {
    await MMKV.setMapAsync('user', value);
    setUserStatus(UserStatus.Logged);
  };

  const onLogout = async () => {
    await MMKV.removeItem('user');
    setUserStatus(UserStatus.NotLogged);
  };

  const checkKeyExists = async () => {
    const exists = await checkKey();
    setKeyExists(exists);
  };

  useEffect(() => {
    getUserStatus();
    checkSupport(setIsSupported);
  }, []);

  useEffect(() => {
    checkKeyExists();
  }, [isSupported]);

  return (
    <SecurityScreen>
      <SafeAreaView style={apply(C.flex)}>
        {userStatus === UserStatus.Logged && (
          <Home
            onLogout={onLogout}
            isSupported={isSupported}
            keyExists={keyExists}
            onKeyRemoved={() => setKeyExists(false)}
            onKeyCreated={() => setKeyExists(true)}
          />
        )}
        {userStatus === UserStatus.NotLogged && (
          <Auth
            keyExists={keyExists}
            onLogin={onLogin}
            isSupported={isSupported}
          />
        )}
        {userStatus === UserStatus.Idle && <ActivityIndicator color="black" />}
      </SafeAreaView>
    </SecurityScreen>
  );
};

export default App;
