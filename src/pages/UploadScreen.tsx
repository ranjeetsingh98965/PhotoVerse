import React, {useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '@env';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import failedSnackbar from '../components/SnackBars/failedSnackbar';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const UploadScreen = () => {
  const navigation = useNavigation();
  const [imgUri, setImgUri] = useState('');
  const [imgDetails, setImgDetails] = useState({});
  const [postModal, setPostModal] = useState(false);
  const [postCaption, setPostCaption] = useState('');
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

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        // console.log('res: ', response);
        // const name = response.assets[0].fileName;
        // const type = response.assets[0].type;
        const path = response.assets[0].uri;
        setImgUri(path);
        setImgDetails(response.assets[0]);
        setPostModal(true);
      }
    });
  };

  const uploadPost = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      const user_id = await AsyncStorage.getItem('userId');
      formData.append('user_id', user_id);
      formData.append('caption', postCaption);
      formData.append('image', {
        name: imgDetails.fileName,
        type: imgDetails.type,
        uri: imgDetails.uri,
      });

      const headers = {
        'Content-Type': 'multipart/form-data',
      };

      // console.log('fuck: ', JSON.stringify(formData));

      let response = await axios.post(`${BASE_URL}create_post`, formData, {
        headers,
      });
      // console.log('res: ', typeof response.data.status, ' , ', response.data);
      if (response.data.status == true) {
        setLoading(false);
        navigation.replace('feed');
      } else {
        failedSnackbar('Something went wrong!');
        setLoading(false);
      }
    } catch (err) {
      console.log('err: ', err);
      setLoading(false);
      failedSnackbar('Something went wrong!');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          padding: 10,
          paddingVertical: 15,
          alignItems: 'center',
        }}>
        <View style={{flex: 1, paddingHorizontal: 10}}>
          <Text
            style={{
              fontWeight: 'bold',
              color: '#fff',
              fontSize: 18,
              textAlign: 'center',
            }}>
            New Post
          </Text>
        </View>
      </View>

      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => {
            setPostCaption('');
            pickImage();
          }}
          style={{
            backgroundColor: '#1A1A1A',
            width: '40%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 10,
            borderRadius: 10,
          }}>
          <Feather name="upload" color={'#fff'} size={25} />
          <Text
            style={{
              marginTop: 5,
              fontWeight: '500',
              fontSize: 14,
              color: '#fff',
            }}>
            UPLOAD
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={postModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setPostModal(false);
          setImgUri('');
        }}>
        <View style={{flex: 1, backgroundColor: '#000'}}>
          {/* New Post Header */}
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              paddingVertical: 15,
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                setPostModal(false);
                setImgUri('');
              }}
              style={{position: 'absolute', left: 0, paddingHorizontal: 10}}>
              <Icon name="arrow-left" size={22} color={'#fff'} />
            </TouchableOpacity>
            <View style={{flex: 1, paddingHorizontal: 10}}>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: '#fff',
                  fontSize: 18,
                  textAlign: 'center',
                }}>
                Comments
              </Text>
            </View>
            <TouchableOpacity
              onPress={uploadPost}
              style={{position: 'absolute', right: 0, paddingHorizontal: 10}}>
              <Text
                style={{color: '#0095F6', fontWeight: 'bold', fontSize: 16}}>
                POST
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{flex: 1, justifyContent: 'center'}}>
            {/* <Image
              source={{uri: imgUri}}
              style={{width: '100%', height: '50%'}}
              resizeMode="contain"
            /> */}

            <ImageViewer
              imageUrls={[
                {
                  url: imgUri,
                },
              ]}
              onSwipeDown={() => {}}
              enableSwipeDown={true}
              renderIndicator={() => null}
              loadingRender={() => (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              style={{
                flex: 1,
              }}
            />
          </View>

          <View style={{backgroundColor: '#1A1A1A', paddingHorizontal: 10}}>
            <TextInput
              placeholder="Write a caption..."
              placeholderTextColor="grey"
              style={{color: '#fff'}}
              onChangeText={txt => setPostCaption(txt)}
              value={postCaption}
            />
          </View>
        </View>
      </Modal>

      {/* loading */}
      <Modal transparent={true} visible={loading} animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,.5)',
          }}>
          <ActivityIndicator size={50} color={'#fff'} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};
export default UploadScreen;
