import React, { useContext } from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../utils/colors';
import { AuthContext } from '../context/AuthContext';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import ItemListScreen from '../screens/items/ItemListScreen';
import ItemDetailsScreen from '../screens/items/ItemDetailsScreen';
import CreateItemScreen from '../screens/items/CreateItemScreen';
import EditItemScreen from '../screens/items/EditItemScreen';
import CreateClaimScreen from '../screens/claims/CreateClaimScreen';
import MyClaimsScreen from '../screens/claims/MyClaimsScreen';
import ClaimDetailsScreen from '../screens/claims/ClaimDetailsScreen';
import AdminClaimsScreen from '../screens/admin/AdminClaimsScreen';
import AdminItemManagementScreen from '../screens/admin/AdminItemManagementScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const MainTabs = () => {
  const { isAdmin } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused }) => {
          let icon = '📦';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Items') icon = '🔍';
          else if (route.name === 'MyClaims') icon = '📋';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 20 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'CampusConnect' }}
      />
      <Tab.Screen
        name="Items"
        component={ItemListScreen}
        options={{ title: 'Campus Items' }}
      />
      <Tab.Screen
        name="MyClaims"
        component={MyClaimsScreen}
        options={{ title: 'My Claims' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

// Root App Stack
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ItemDetails"
        component={ItemDetailsScreen}
        options={{ title: 'Item Details' }}
      />
      <Stack.Screen
        name="CreateItem"
        component={CreateItemScreen}
        options={{ title: 'Report Item' }}
      />
      <Stack.Screen
        name="EditItem"
        component={EditItemScreen}
        options={{ title: 'Edit Report' }}
      />
      <Stack.Screen
        name="CreateClaim"
        component={CreateClaimScreen}
        options={{ title: 'Claim Belonging' }}
      />
      <Stack.Screen
        name="ClaimDetails"
        component={ClaimDetailsScreen}
        options={{ title: 'Claim Details' }}
      />
      <Stack.Screen
        name="AdminClaims"
        component={AdminClaimsScreen}
        options={{ title: 'Review Pending Claims' }}
      />
      <Stack.Screen
        name="AdminItemManagement"
        component={AdminItemManagementScreen}
        options={{ title: 'Campus Item Registry' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
