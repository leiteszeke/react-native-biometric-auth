import MMKVStorage from 'react-native-mmkv-storage';
import ReactNativeBiometrics from 'react-native-biometrics';

export const MMKV = new MMKVStorage.Loader().initialize();

export enum UserStatus {
  Idle = 'idle',
  NotLogged = 'not_logged',
  Logged = 'logged',
}

export const checkSupport = async (setterFn: (value: boolean) => void) => {
  const isSupported = await ReactNativeBiometrics.isSensorAvailable();

  setterFn(isSupported.available);
};

export const checkKey = async (): Promise<boolean> =>
  (await ReactNativeBiometrics.biometricKeysExist()).keysExist;
