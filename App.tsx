import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import APITest from './src/APITest';
import AppNavigator from './src/navigation/AppNavigator';
import { RegistrationProvider } from './src/context/RegistrationContext';

export default function App() {
  return (
    // <APITest />
    <>
      <StatusBar style="auto" />
      <RegistrationProvider>
        <AppNavigator />
      </RegistrationProvider>
    </>
  );
}

