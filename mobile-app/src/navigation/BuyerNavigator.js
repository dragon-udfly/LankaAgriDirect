import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Text} from 'react-native';
import HomeScreen from '../screens/buyer/HomeScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import BookmarksScreen from '../screens/buyer/BookmarksScreen';
import {COLORS} from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {backgroundColor: COLORS.primary},
      headerTintColor: COLORS.white,
      headerTitleStyle: {fontWeight: '700'},
    }}>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{title: '🌿 Lanka Agri-Direct'}}
    />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{title: 'Product Details'}}
    />
  </Stack.Navigator>
);

export const BuyerNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarStyle: {
        borderTopColor: COLORS.border,
        paddingBottom: 6,
        paddingTop: 4,
        height: 60,
      },
      headerShown: false,
    }}>
    <Tab.Screen
      name="BuyerHome"
      component={HomeStack}
      options={{
        tabBarLabel: 'Browse',
        tabBarIcon: ({color}) => <Text style={{fontSize: 20, color}}>🛍️</Text>,
      }}
    />
    <Tab.Screen
      name="Bookmarks"
      component={BookmarksScreen}
      options={{
        tabBarLabel: 'Saved',
        tabBarIcon: ({color}) => <Text style={{fontSize: 20, color}}>⭐</Text>,
        headerShown: true,
        headerStyle: {backgroundColor: COLORS.primary},
        headerTintColor: COLORS.white,
        headerTitle: 'My Bookmarks',
        headerTitleStyle: {fontWeight: '700'},
      }}
    />
  </Tab.Navigator>
);
