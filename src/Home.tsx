import C, { apply } from 'consistencss';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Button, Text, Toast } from 'react-native-ui-lib';
import localhost from 'react-native-localhost';
import { getUniqueId } from 'react-native-device-info';
import { MMKV } from './utils';

const Home = ({
  onLogout,
  isSupported,
  keyExists,
  onKeyRemoved,
  onKeyCreated,
}: {
  onLogout: () => void;
  onKeyRemoved: () => void;
  onKeyCreated: () => void;
  isSupported: boolean;
  keyExists: boolean;
}) => {
  const [justRemoved, setJustRemoved] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  const logout = () => {
    onLogout();
  };

  const auth = useCallback(async () => {
    try {
      setShowToast(false);

      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Log in',
      });

      if (success) {
        const { publicKey } = await ReactNativeBiometrics.createKeys();
        const user = (await MMKV.getMapAsync('user')) as { id: number };
        const payload = getUniqueId();

        const request = await fetch(`http://${localhost}:3500/biometrics`, {
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

        onKeyCreated();
      }
    } catch (e) {
      console.log('Error', e);
    }
  }, [onKeyCreated]);

  const remove = () => {
    ReactNativeBiometrics.deleteKeys();
    setJustRemoved(true);
    onKeyRemoved();
  };

  useEffect(() => {
    if (isSupported && !keyExists && !justRemoved) {
      setShowToast(true);
    }
  }, [auth, keyExists, isSupported, justRemoved]);

  useEffect(() => {
    return () => {
      setJustRemoved(false);
      setShowToast(false);
    };
  }, []);

  return (
    <View style={apply(C.flex, C.justifyCenter, C.px4)}>
      <View style={apply(C.justifyCenter, C.itemsCenter, C.mb4)}>
        {!isSupported && <Text>Face ID not supported</Text>}
      </View>

      <Button onPress={logout} label="Logout" style={C.mb2} />
      {isSupported && keyExists && (
        <Button onPress={remove} label="Remove Face ID" />
      )}

      <Toast
        visible={showToast}
        message="Do you want to login with Face ID?"
        position="bottom"
        action={{
          label: 'Aceptar',
          onPress: auth,
        }}
      />
    </View>
  );
};

export default Home;
