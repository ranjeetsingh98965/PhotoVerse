import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Image, StatusBar, Text, View} from 'react-native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    getUserCerdentials();
  }, []);

  const getUserCerdentials = async () => {
    const userId = await AsyncStorage.getItem('userId');
    // console.log('lolo: ', userId);
    setTimeout(() => {
      if (userId != '' && userId != null) {
        navigation.replace('feed');
      } else {
        navigation.replace('login');
      }
    }, 1500);
    return () => clearTimeout(subscription);
  };

  return (
    <>
      <StatusBar hidden={true} backgroundColor={'#000'} />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}>
        <Image
          source={require('../assets/images/logo/logo.png')}
          style={{width: 100, height: 100}}
          resizeMode="contain"
        />
      </View>
    </>
  );
};
export default SplashScreen;
