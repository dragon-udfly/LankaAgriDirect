import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Text, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import HomeScreen from '../screens/buyer/HomeScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import BookmarksScreen from '../screens/buyer/BookmarksScreen';
import {COLORS} from '../theme/colors';
import {useAuth} from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  const {user, signOut} = useAuth();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: COLORS.primary},
        headerTintColor: COLORS.white,
        headerTitleStyle: {fontWeight: '700'},
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({navigation}) => ({
          title: '🌿 Lanka Agri-Direct',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => (user ? signOut() : navigation.navigate('Login'))}
              style={{
                marginRight: 16,
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}>
              <Text style={{color: COLORS.white, fontWeight: '600', fontSize: 13}}>
                {user ? 'Log Out' : 'Log In'}
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{title: 'Product Details'}}
      />
    </Stack.Navigator>
  );
};

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
        tabBarIcon: ({color, size}) => <Ionicons name="cart-outline" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Bookmarks"
      component={BookmarksScreen}
      options={{
        tabBarLabel: 'Saved',
        tabBarIcon: ({color, size}) => <Ionicons name="bookmark-outline" size={size} color={color} />,
        headerShown: true,
        headerStyle: {backgroundColor: COLORS.primary},
        headerTintColor: COLORS.white,
        headerTitle: 'My Bookmarks',
        headerTitleStyle: {fontWeight: '700'},
      }}
    />
  </Tab.Navigator>
);
