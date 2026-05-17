import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuth} from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import {BuyerNavigator} from './BuyerNavigator';
import {ProducerNavigator} from './ProducerNavigator';
import {View, ActivityIndicator} from 'react-native';
import {COLORS} from '../theme/colors';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="BuyerTabs" component={BuyerNavigator} />
        </>
      ) : user.role === 'PRODUCER' ? (
        <Stack.Screen name="ProducerApp" component={ProducerNavigator} />
      ) : (
        // Admin — redirect to buyer tabs as fallback (admin uses web dashboard)
        <Stack.Screen name="BuyerTabs" component={BuyerNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
