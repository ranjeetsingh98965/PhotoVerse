import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import failedSnackbar from '../components/SnackBars/failedSnackbar';
import successSnackbar from '../components/SnackBars/successSnackbar';
import warningSnackbar from '../components/SnackBars/warningSnackbar';
import {launchImageLibrary} from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import messageSnackbar from '../components/SnackBars/messageSnackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import {BASE_URL} from '@env';
import ImageCropPicker from 'react-native-image-crop-picker';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const SignupScreen = () => {
  const navigation = useNavigation();
  const [userImage, setUserImage] = useState('');
  const [imageName, setImageName] = useState('');
  const [userImageDetail, setUserImageDetail] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');
  const [bio, setBio] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // back button handle
  const backButtonHandler = () => {
    navigation.goBack();
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backButtonHandler,
      );
      return () => backHandler.remove();
    }, []),
  );
  //  End back handle

  useEffect(() => {
    // Set up event listeners for keyboard show and hide events
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // Keyboard is open
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // Keyboard is closed
      },
    );

    // Cleanup the event listeners when the component is unmounted
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      warningSnackbar('Email cannot be empty.');
      return false;
    } else if (!emailPattern.test(email)) {
      warningSnackbar('Please enter a valid email address.');
      return false;
    } else {
      return true; // No error
    }
  }

  function validatePassword(password) {
    const minLength = 8;
    const numberPattern = /\d/;
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

    if (!password) {
      warningSnackbar('Password cannot be empty.');
      return false;
    } else if (password.length < minLength) {
      warningSnackbar(
        `Password must be at least ${minLength} characters long.`,
      );
      return false;
    } else if (!numberPattern.test(password)) {
      warningSnackbar('Password must include at least one number.');
      return false;
    } else if (!specialCharPattern.test(password)) {
      warningSnackbar('Password must include at least one special character.');
      return false;
    } else {
      return true; // No error
    }
  }

  const handleSignup = async () => {
    if (
      userImage != '' &&
      email != '' &&
      password != '' &&
      username != '' &&
      bio != ''
    ) {
      if (validateEmail(email)) {
        if (validatePassword(password)) {
          setLoading(true);
          try {
            const userCredential = await auth().createUserWithEmailAndPassword(
              email,
              password,
            );
            if (userCredential.user) {
              await userCredential.user.sendEmailVerification();
              messageSnackbar(
                'Verification email sent. Please verify your email.',
              );
              console.log('bta bhai: ', typeof userCredential.user.uid);
              // Store user data in AsyncStorage
              const userData = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: username,
                photoURL: userImage,
                password: password,
              };

              const deviceInfo = {
                brand: await DeviceInfo.getBrand(),
                model: await DeviceInfo.getModel(),
                systemName: await DeviceInfo.getSystemName(),
                systemVersion: await DeviceInfo.getSystemVersion(),
                deviceId: await DeviceInfo.getDeviceId(),
                uniqueId: await DeviceInfo.getUniqueId(),
                apiLevel: await DeviceInfo.getApiLevel(),
                isEmulator: await DeviceInfo.isEmulator(),
                isTablet: await DeviceInfo.isTablet(),
                manufacturer: await DeviceInfo.getManufacturer(),
                appVersion: await DeviceInfo.getVersion(),
                appName: await DeviceInfo.getApplicationName(),
                buildNumber: await DeviceInfo.getBuildNumber(),
                carrier: await DeviceInfo.getCarrier(),
                totalDiskCapacity: await DeviceInfo.getTotalDiskCapacity(),
                isPinOrFingerprintSet: await DeviceInfo.isPinOrFingerprintSet(),
              };

              // Store user data in Firestore
              await firestore()
                .collection('users')
                .doc(userData.uid)
                .set({
                  ...userData,
                  deviceInfo,
                  bio, // Include the bio in the user data
                  createdAt: firestore.FieldValue.serverTimestamp(), // Add timestamp
                });

              let formData = new FormData();
              formData.append('uid', userCredential.user.uid);
              formData.append('username', username);
              formData.append('email', userCredential.user.email);
              formData.append('password', password);
              formData.append('bio', bio);
              formData.append('deviceinfo', 'info');
              formData.append('image', {
                name: imageName,
                type: userImageDetail.mime,
                uri: userImageDetail.path,
              });
              console.log('fuck: ', formData);

              const headers = {
                'Content-Type': 'multipart/form-data',
              };

              let response = await axios.post(`${BASE_URL}register`, formData, {
                headers,
              });
              console.log('signup userId res: ', response.data.data[0].id);
              await AsyncStorage.setItem('userId', response.data.data[0].id);
              await userCredential.user.updateProfile({
                displayName: username,
                photoURL: userImage,
              });
              console.log('ress: ', userCredential.user);

              await AsyncStorage.setItem('emailVerified', 'false');

              console.log('data: ', formData);
              const verificationCheckInterval = setInterval(async () => {
                await auth().currentUser.reload(); // Reload the user's info
                const isVerified = auth().currentUser.emailVerified;
                setEmailVerified(isVerified);
                if (isVerified) {
                  clearInterval(verificationCheckInterval); // Stop checking once verified
                  Keyboard.dismiss();
                  await AsyncStorage.setItem('emailVerified', 'true');
                  successSnackbar(
                    'Email verified! You have successfully registered.',
                  );
                  setLoading(false);
                  navigation.replace('feed'); // Redirect to Home screen
                }
              }, 5000);
            }
          } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
              const currentUser = auth().currentUser;

              if (currentUser && !currentUser.emailVerified) {
                // User exists but hasn't verified their email
                setLoading(false);
                warningSnackbar(
                  'This email is already in use but not verified. Resending verification email.',
                );
                await currentUser.sendEmailVerification();
              } else {
                setLoading(false);
                failedSnackbar(
                  'The email address is already in use by another account.',
                );
              }
            } else {
              console.error('Signup error:', error);
              setLoading(false);
              failedSnackbar(
                error.message || 'Something went wrong. Please try again.',
              );
            }
          }
        }
      }
    } else {
      if (
        userImage == '' ||
        email == '' ||
        password == '' ||
        username == '' ||
        bio == ''
      ) {
        if (
          userImage == '' &&
          email != '' &&
          password != '' &&
          username != '' &&
          bio != ''
        ) {
          warningSnackbar('Please upload a profile picture.');
        } else {
          warningSnackbar('All fields are required.');
        }
      }
    }
  };

  // const pickImage = () => {
  //   const options = {
  //     mediaType: 'photo',
  //   };

  //   launchImageLibrary(options, response => {
  //     if (response.didCancel) {
  //       console.log('User cancelled image picker');
  //     } else if (response.error) {
  //       console.log('ImagePicker Error: ', response.error);
  //     } else {
  //       const uri = response.assets[0].uri;
  //       setUserImage(uri);
  //       console.log('image lele: ', userImage);
  //     }
  //   });
  // };

  const pickImage = () => {
    ImageCropPicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: windowWidth,
      height: (windowHeight * 40) / 100,
      // includeBase64: true,
    })
      .then(image => {
        const uri = image.path;
        const imageName = uri.substring(uri.lastIndexOf('/') + 1);
        setImageName(imageName);
        setUserImage(uri);
        setUserImageDetail(image);
        console.log('Cropped image URI: ', image);
        console.log(
          'Cropped image URL: ',
          uri.substring(uri.lastIndexOf('/') + 1),
        );
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
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

          {/* user Image */}
          <View style={{marginTop: 20}}>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                width: 130,
                height: 130,
                backgroundColor: '#000',
                borderRadius: 100,
              }}>
              <View
                style={{
                  backgroundColor: '#0095F6',
                  position: 'absolute',
                  zIndex: 999,
                  right: 8,
                  bottom: 8,
                  padding: 5,
                  borderRadius: 40,
                }}>
                <Icon name="camera-plus-outline" color="#fff" size={16} />
              </View>
              <Image
                source={
                  userImage == ''
                    ? require('../assets/images/profile/noProfile.png')
                    : {
                        uri: userImage,
                      }
                }
                style={{width: '100%', height: '100%', borderRadius: 100}}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {/* username */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              width: '95%',
              paddingHorizontal: 10,
              marginTop: 20,
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 5,
              }}>
              <Icon name="account-outline" size={20} color={'#fff'} />
            </View>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Enter your username"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={txt => setUserName(txt)}
                value={username}
              />
            </View>
          </View>

          {/* email */}
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
                secureTextEntry={true}
                placeholder="Enter your password"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={txt => setPassword(txt)}
                value={password}
              />
            </View>
          </View>

          {/* bio */}
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
              <Icon
                name="file-document-edit-outline"
                size={20}
                color={'#fff'}
              />
            </View>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Enter your bio"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={txt => setBio(txt)}
                value={bio}
              />
            </View>
          </View>

          {/* Signup Btn */}
          <TouchableOpacity
            disabled={loading ? true : false}
            onPress={() => {
              handleSignup();
            }}
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
              <Text style={{fontSize: 16, color: '#fff'}}>Sign up</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Don't have an account?Sign up Btn */}
      {!keyboardVisible ? (
        <View
          style={{
            backgroundColor: '#000',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10,
          }}>
          <Text style={{color: '#fff', fontSize: 12}}>Have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={{fontWeight: 'bold', color: '#fff'}}>Login.</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
};
export default SignupScreen;
