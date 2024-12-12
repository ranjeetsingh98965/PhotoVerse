import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  Modal,
  Touchable,
  TouchableOpacity,
  BackHandler,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import ImageViewer from 'react-native-image-zoom-viewer';
import {ActivityIndicator} from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import failedSnackbar from '../components/SnackBars/failedSnackbar';
import {BASE_URL, IMAGE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [imageList, setImageList] = useState([]);
  const [viewImageModal, setViewImageModal] = useState(false);
  const [searchList, setSearchList] = useState([]);
  const [searchModal, setSearchModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [imgListLoading, setImgListLoading] = useState(false);
  const [searchresponseCode, setSearchresponseCode] = useState(false);
  const timeoutRef = useRef(null);

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

  const startTimer = (txt: String) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchUser(txt);
    }, 1000);
  };

  const searchUser = async (txt: String) => {
    setSearchLoading(true);
    try {
      const data = {
        search: txt,
      };
      // console.log('search data: ', data);
      if (txt != '') {
        let res = await axios.post(`${BASE_URL}search_users_profile`, data);
        // console.log('search res: ', res.data.data);
        if (res.data.status == true) {
          setSearchList(res.data.data);
          setSearchresponseCode(true);
          setSearchLoading(false);
        } else {
          failedSnackbar('Something went wrong!');
          setSearchLoading(false);
        }
      } else {
        setSearchList([]);
        setSearchLoading(false);
      }
    } catch (err) {
      console.log('search err: ', err);
      setSearchLoading(false);
      failedSnackbar('Something went wrong!');
    }
  };

  const getImageList = async () => {
    setImgListLoading(true);
    try {
      const user_id = await AsyncStorage.getItem('userId');
      const data = {
        user_id: user_id,
      };
      console.log('search data: ', data);
      let res = await axios.post(`${BASE_URL}feed_search`, data);
      // console.log('image list  res: ', res.data.data.search_data);
      if (res.data.status == true) {
        setImageList(res.data.data.search_data);
        setImgListLoading(false);
      } else {
        failedSnackbar('Something went wrong!');
        setImgListLoading(false);
      }
    } catch (err) {
      console.log('search err: ', err);
      setImgListLoading(false);
      failedSnackbar('Something went wrong!');
    }
  };

  const checkUserProfile = async id => {
    const user_id = await AsyncStorage.getItem('userId');
    if (user_id == id) {
      navigation.navigate('feed', {screen: 'account'});
    } else {
      navigation.navigate('checkprofile', {
        checkUserId: id,
      });
    }
  };

  useEffect(() => {
    getImageList();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => {
          setSearchList([]);
          setSearchText('');
          setSearchresponseCode(false);
          setSearchModal(true);
        }}
        style={{
          backgroundColor: '#1A1A1A',
          flexDirection: 'row',
          paddingHorizontal: 10,
          alignItems: 'center',
          paddingVertical: 15,
        }}>
        <Feather name="search" size={20} color={'#fff'} />
        <View style={{marginHorizontal: 10}}>
          <Text style={{color: 'grey'}}>Search...</Text>
        </View>
      </TouchableOpacity>

      {/* Images */}
      {!imgListLoading ? (
        <>
          {imageList.length > 0 ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={imageList}
              numColumns={3}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(`${IMAGE_URL}${item.image_url}`);
                      setViewImageModal(true);
                    }}>
                    <Image
                      source={{uri: `${IMAGE_URL}${item.image_url}`}}
                      style={{
                        width: windowWidth / 3,
                        height: 130,
                        borderColor: '#000',
                        borderWidth: 1,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: '20%',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 14,
                  textAlign: 'center',
                }}>
                Oops! Looks like we’re out of images. Stay tuned for more.
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* view Image */}
      <Modal
        visible={viewImageModal}
        animationType="fade"
        onRequestClose={() => setViewImageModal(false)}>
        <View style={{flex: 1, backgroundColor: '#000'}}>
          {/* header */}
          <TouchableOpacity
            onPress={() => setViewImageModal(false)}
            style={{position: 'absolute', zIndex: 99, top: 10, left: 10}}>
            <Icon name="arrow-left" size={22} color={'#fff'} />
          </TouchableOpacity>

          <ImageViewer
            imageUrls={[
              {
                url: selectedImage,
              },
            ]}
            onSwipeDown={() => setViewImageModal(false)}
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
              width: windowWidth,
              height: windowHeight,
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={searchModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSearchModal(false)}>
        <View style={{flex: 1, backgroundColor: '#000'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => setSearchModal(false)}
              style={{paddingHorizontal: 10}}>
              <Icon name="close" size={22} color={'#fff'} />
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: '#1A1A1A',
                flexDirection: 'row',
                paddingHorizontal: 10,
                alignItems: 'center',
                borderRadius: 10,
                marginRight: 50,
              }}>
              <Feather name="search" size={20} color={'#fff'} />
              <TextInput
                placeholder="Search..."
                placeholderTextColor={'grey'}
                onChangeText={txt => {
                  setSearchText(txt);
                  startTimer(txt);
                  setSearchresponseCode(false);
                }}
                value={searchText}
                style={{flex: 1, marginHorizontal: 10, color: '#fff'}}
              />
            </View>
          </View>

          {/* search results */}
          {!searchLoading ? (
            <>
              {searchList.length > 0 ? (
                <FlatList
                  data={searchList}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{paddingVertical: 10}}
                  renderItem={({item}) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          checkUserProfile(item.id);
                          setTimeout(() => {
                            setViewImageModal(false);
                            setSearchModal(false);
                          }, 800);
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 10,
                          marginVertical: 2,
                        }}>
                        <View>
                          <Image
                            source={
                              item.profile_picture != '' &&
                              item.profile_picture != null
                                ? {
                                    uri: `${IMAGE_URL}${item.profile_picture}`,
                                  }
                                : require('../assets/images/profile/noProfile.png')
                            }
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 50,
                              borderWidth: 0.5,
                              borderColor: '#fff',
                            }}
                            resizeMode="cover"
                          />
                        </View>
                        <View style={{flex: 1, marginHorizontal: 10}}>
                          <View>
                            <Text style={{fontWeight: 'bold', color: '#fff'}}>
                              {item.username}{' '}
                            </Text>
                          </View>
                          <View>
                            <Text style={{fontSize: 11, color: 'grey'}}>
                              {item.bio}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <>
                  {searchresponseCode == true ? (
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                      }}>
                      {/* <ActivityIndicator size="small" color="#fff" /> */}
                      <Text style={{color: 'grey'}}>No user found!</Text>
                    </View>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};
export default SearchScreen;

// const imageData = [
//   'https://images.pexels.com/photos/158063/bellingrath-gardens-alabama-landscape-scenic-158063.jpeg',
//   'https://images.pexels.com/photos/36487/above-adventure-aerial-air.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg',
//   'https://images.pexels.com/photos/707344/pexels-photo-707344.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1097456/pexels-photo-1097456.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/2681319/pexels-photo-2681319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1767434/pexels-photo-1767434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1918290/pexels-photo-1918290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/158063/bellingrath-gardens-alabama-landscape-scenic-158063.jpeg',
//   'https://images.pexels.com/photos/36487/above-adventure-aerial-air.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg',
//   'https://images.pexels.com/photos/707344/pexels-photo-707344.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1097456/pexels-photo-1097456.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/2681319/pexels-photo-2681319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1767434/pexels-photo-1767434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
//   'https://images.pexels.com/photos/1918290/pexels-photo-1918290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
// ];
