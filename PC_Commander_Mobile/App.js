/**
 * PC Commander - 独立手机App
 * 使用 React Native 开发的原生应用
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// 导入页面
import HomeScreen from './src/screens/HomeScreen';
import ConfigScreen from './src/screens/ConfigScreen';
import ChatScreen from './src/screens/ChatScreen';
import TerminalScreen from './src/screens/TerminalScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0F2943',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'PC Commander' }}
          />
          <Stack.Screen 
            name="Config" 
            component={ConfigScreen}
            options={{ title: 'API 配置' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: 'AI 助手' }}
          />
          <Stack.Screen 
            name="Terminal" 
            component={TerminalScreen}
            options={{ title: '终端' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}
