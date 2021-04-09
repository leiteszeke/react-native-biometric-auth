import C, { apply } from 'consistencss';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AppState, View, AppStateStatus, Platform } from 'react-native';

const showSecurityScreenFromAppState = (appState: AppStateStatus) =>
  ['background', 'inactive'].includes(appState);

const SecurityScreen = ({ children }: PropsWithChildren<{}>) => {
  const [showSecurityScreen, setShowSecurityScreen] = useState<boolean>(
    Platform.OS === 'ios'
      ? showSecurityScreenFromAppState(AppState.currentState)
      : false,
  );

  const onChangeAppState = (nextAppState: AppStateStatus) => {
    setShowSecurityScreen(showSecurityScreenFromAppState(nextAppState));
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppState.addEventListener('change', onChangeAppState);

      return () => {
        AppState.removeEventListener('change', onChangeAppState);
      };
    }
  }, []);

  if (showSecurityScreen) {
    return <View style={apply(C.flex, C.bgWhite)} />;
  }

  return <>{children}</>;
};

export default SecurityScreen;
