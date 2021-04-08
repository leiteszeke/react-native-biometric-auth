import C, { apply } from 'consistencss';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import MMKVStorage from 'react-native-mmkv-storage';
import { Button, TextField } from 'react-native-ui-lib';
import localhost from 'react-native-localhost';
import SecurityScreen from './SecurityScreen';
import { getUniqueId } from 'react-native-device-info';

const MMKV = new MMKVStorage.Loader().initialize();

enum UserStatus {
  Idle = 'idle',
  NotLogged = 'not_logged',
  Logged = 'logged',
}

const checkSupport = async (setterFn: (value: boolean) => void) => {
  const isSupported = await ReactNativeBiometrics.isSensorAvailable();

  setterFn(isSupported.available);
};

const checkKey = async (): Promise<boolean> =>
  (await ReactNativeBiometrics.biometricKeysExist()).keysExist;

const Auth = ({
  onLogin,
  isSupported,
  keyExists,
}: {
  onLogin: (value: object) => void;
  isSupported: boolean;
  keyExists: boolean;
}) => {
  const [form, setForm] = useState<{ email: String; password: string }>({
    email: '',
    password: '',
  });

  const auth = async () => {
    const { success } = await ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Log in',
    });

    if (success) {
      const payload = getUniqueId();

      const { signature } = await ReactNativeBiometrics.createSignature({
        promptMessage: 'Log in',
        payload,
      });

      if (signature) {
        const request = await fetch(`http://${localhost}:3001/bio-auth`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            signature,
            payload,
          }),
        });

        const response = await request.json();

        if (response.user) {
          onLogin(response.user);
        }
      }
    }
  };

  const login = async () => {
    const request = await fetch(`http://${localhost}:3001/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });
    const response = await request.json();

    if (response.user) {
      onLogin(response.user);
    }
  };

  const setFormValue = (name: string) => (event: {
    nativeEvent: { text: string };
    persist: () => void;
  }) => {
    event.persist();

    setForm(prev => ({
      ...prev,
      [name]: event.nativeEvent.text,
    }));
  };

  return (
    <View style={apply(C.flex, C.justifyCenter, C.px4)}>
      <TextField
        autoCapitalize="none"
        label="Email"
        placeholder="john.doe@example.com"
        onChange={setFormValue('email')}
      />
      <TextField
        label="Password"
        placeholder="********"
        secureTextEntry={true}
        onChange={setFormValue('password')}
      />
      <Button onPress={login} label="Login" style={C.mb2} />
      {isSupported && keyExists && (
        <Button onPress={auth} label="Login with Face ID" />
      )}
    </View>
  );
};

const Home = ({
  onLogout,
  isSupported,
  keyExists,
  onKeyRemoved,
}: {
  onLogout: () => void;
  onKeyRemoved: () => void;
  isSupported: boolean;
  keyExists: boolean;
}) => {
  const logout = () => {
    onLogout();
  };

  const auth = async () => {
    try {
      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Log in',
      });

      if (success) {
        const { publicKey } = await ReactNativeBiometrics.createKeys();
        const user = (await MMKV.getMapAsync('user')) as { id: number };
        const payload = getUniqueId();

        const request = await fetch(`http://${localhost}:3001/biometrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            publicKey,
            payload,
          }),
        });

        await request.json();
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const remove = () => {
    ReactNativeBiometrics.deleteKeys();
    onKeyRemoved();
  };

  useEffect(() => {
    if (isSupported && !keyExists) {
      auth();
    }
  }, [keyExists, isSupported]);

  return (
    <View style={apply(C.flex, C.justifyCenter, C.px4)}>
      <Button onPress={logout} label="Logout" style={C.mb2} />
      {isSupported && keyExists && (
        <Button onPress={remove} label="Remove Face ID" />
      )}
    </View>
  );
};

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
