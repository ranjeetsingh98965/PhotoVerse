import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import warningSnackbar from '../components/SnackBars/warningSnackbar';
import auth from '@react-native-firebase/auth';
import failedSnackbar from '../components/SnackBars/failedSnackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '@env';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true; // Prevent the default back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Clean up the listener on unmount
  }, []);

  const HandleLogin = async () => {
    if (email != '' && password != null) {
      setLoading(true);
      try {
        const userCredential = await auth().signInWithEmailAndPassword(
          email,
          password,
        );
        navigation.replace('feed');
        setLoading(false);
        await AsyncStorage.setItem(
          'userId',
          JSON.stringify(userCredential.user.uid),
        );
        // console.log('userData: ', userCredential.user.uid);

        const userData = {
          email: email,
          password: password,
        };
        let res = await axios.post(`${BASE_URL}login`, userData);
        // console.log('res: ', res.data.data[0].id);
        await AsyncStorage.setItem('userId', res.data.data[0].id);
      } catch (error) {
        setLoading(false);
        warningSnackbar(
          error.message || 'Something went wrong. Please try again.',
        );
        console.log(error.message);
      }
    } else {
      warningSnackbar('All fields are required.');
    }
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flex: 1,
        }}>
        <StatusBar
          backgroundColor={'#000'}
          animated={true}
          barStyle={'light-content'}
          hidden={false}
        />

        {/* logo */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
          }}>
          <Image
            source={require('../assets/images/logo_name.png')}
            style={{width: '60%', height: 100}}
            tintColor={'#fff'}
            resizeMode="contain"
          />

          {/* email */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              width: '95%',
              paddingHorizontal: 10,
              marginTop: 30,
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 5,
              }}>
              <Icon name="email-outline" size={20} color={'#fff'} />
            </View>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={txt => setEmail(txt)}
                value={email}
              />
            </View>
          </View>

          {/* password */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              width: '95%',
              paddingHorizontal: 10,
              marginTop: 15,
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 5,
              }}>
              <Icon name="lock-outline" size={20} color={'#fff'} />
            </View>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={txt => setPassword(txt)}
                value={password}
                secureTextEntry={true}
              />
            </View>
          </View>

          {/* Login Btn */}
          <TouchableOpacity
            disabled={loading ? true : false}
            onPress={HandleLogin}
            style={{
              width: '95%',
              borderRadius: 4,
              backgroundColor: '#0095F6',
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 30,
            }}>
            {loading ? (
              <ActivityIndicator color="#fff" size={20} />
            ) : (
              <Text style={{fontSize: 16, color: '#fff'}}>Log in</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Don't have an account?Sign up Btn */}
      <View
        style={{
          backgroundColor: '#000',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 10,
        }}>
        <Text style={{color: '#fff', fontSize: 12}}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('signup')}>
          <Text style={{fontWeight: 'bold', color: '#fff'}}>Sign up.</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
export default LoginScreen;
