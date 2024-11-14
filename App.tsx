import React from 'react';
import {Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LoginScreen from './src/pages/LoginScreen';
import SignupScreen from './src/pages/SignupScreen';
import HomeScreen from './src/pages/HomeScreen';
import UploadScreen from './src/pages/UploadScreen';
import SearchScreen from './src/pages/SearchScreen';
import AccountScreen from './src/pages/AccountScreen';
import SplashScreen from './src/pages/SplashScreen';
import NotificationScreen from './src/pages/NotificationScreen';
import CheckProfile from './src/pages/CheckProfile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const BottomNavigationBar = ({route}) => {
    // console.log('route: ', route.params);
    return (
      <Tab.Navigator
        // initialRouteName={
        //   route.params == undefined ? 'home' : route.params.screen
        // }
        initialRouteName="home"
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopWidth: 0,
            // borderColor: '#fff',
            // borderRadius: 10,
          },
        }}>
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <MaterialCommunityIcons
                    name="home"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        />
        <Tab.Screen
          name="search"
          component={SearchScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <Feather
                    name="search"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        />
        <Tab.Screen
          name="upload"
          component={UploadScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <Feather
                    name="plus-circle"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        />
        {/* <Tab.Screen
          name="notification"
          component={NotificationScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <MaterialCommunityIcons
                    name="cards-heart"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        /> */}
        <Tab.Screen
          name="account"
          component={AccountScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <MaterialCommunityIcons
                    name="account"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        />
      </Tab.Navigator>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="splash">
          <Stack.Screen
            name="splash"
            component={SplashScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="signup"
            component={SignupScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="feed"
            component={BottomNavigationBar}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="checkprofile"
            component={CheckProfile}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};
export default App;
