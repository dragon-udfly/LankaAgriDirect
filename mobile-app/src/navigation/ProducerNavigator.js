import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import DashboardScreen from '../screens/producer/DashboardScreen';
import MyProductsScreen from '../screens/producer/MyProductsScreen';
import AddProductScreen from '../screens/producer/AddProductScreen';
import AccountSettingsScreen from '../screens/producer/AccountSettingsScreen';
import {COLORS} from '../theme/colors';

const Stack = createStackNavigator();

export const ProducerNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {backgroundColor: COLORS.primary},
      headerTintColor: COLORS.white,
      headerTitleStyle: {fontWeight: '700'},
    }}>
    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="MyProducts"
      component={MyProductsScreen}
      options={{title: 'My Products'}}
    />
    <Stack.Screen
      name="AddProduct"
      component={AddProductScreen}
      options={{title: 'Add Product'}}
    />
    <Stack.Screen
      name="EditProduct"
      component={AddProductScreen}
      options={{title: 'Edit Product'}}
    />
    <Stack.Screen
      name="AccountSettings"
      component={AccountSettingsScreen}
      options={{title: 'Account Settings'}}
    />
  </Stack.Navigator>
);
