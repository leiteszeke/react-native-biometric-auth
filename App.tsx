import React from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

const App = () => {
  const auth = async () => {
    const isSupported = await ReactNativeBiometrics.isSensorAvailable();

    console.log('isSupported', isSupported);

    const key = await ReactNativeBiometrics.createKeys('myFingerPrint');

    console.log('Key', key);

    try {
      const signature = await ReactNativeBiometrics.createSignature({
        promptMessage: 'Log in',
        payload: 'my payload',
      });

      console.log('Signature', signature);
    } catch (e) {
      console.log('Error', e);
    }
  };

  return (
    <SafeAreaView
      style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <TouchableOpacity onPress={auth}>
        <Text>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default App;
