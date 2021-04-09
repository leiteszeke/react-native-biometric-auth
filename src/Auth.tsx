import C, { apply } from 'consistencss';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Button, TextField } from 'react-native-ui-lib';
import localhost from 'react-native-localhost';
import { getUniqueId } from 'react-native-device-info';

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

  const auth = useCallback(async () => {
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
  }, [onLogin]);

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
        autoCorrect={false}
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

export default Auth;
