import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import failedSnackbar from '../components/SnackBars/failedSnackbar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL, IMAGE_URL} from '@env';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CheckProfile = ({route}) => {
  const checkUserId = route.params.checkUserId;
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState('');
  const [viewImageModal, setViewImageModal] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [postData, setPostData] = useState([]);
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

  const getProfileDetails = async () => {
    setLoading(true);
    try {
      const user_id = await AsyncStorage.getItem('userId');
      const data = {
        user_id: checkUserId,
        my_id: user_id,
      };
      console.log('get profile data: ', data);
      let res = await axios.post(`${BASE_URL}users_profile`, data);
      console.log('get profile res: ', res.data.data['user_details']);
      if (res.data.status == true) {
        setProfileData(res.data.data['user_details']);
        setPostData(res.data.data['feed_data']);
        setLoading(false);
      } else {
        failedSnackbar('Something went wrong!');
        setLoading(false);
      }
    } catch (err) {
      console.log('get comment err: ', err);
      setLoading(false);
      failedSnackbar('Something went wrong!');
    }
  };

  const followAndUnfollow = async () => {
    try {
      setProfileData(prevData => ({
        ...prevData,
        is_following: prevData.is_following === '1' ? '0' : '1',
        followers_count:
          prevData.is_following === '1'
            ? (parseInt(prevData.followers_count) - 1).toString()
            : (parseInt(prevData.followers_count) + 1).toString(),
      }));
      const user_id = await AsyncStorage.getItem('userId');
      const data = {
        user_id: user_id,
        follower_id: user_id,
        following_id: checkUserId,
        value: profileData.is_following == 0 ? 1 : 0,
      };
      // console.log('get profile data: ', data);
      let res = await axios.post(`${BASE_URL}follow_and_unfollow`, data);
      console.log('follow kiya kya: ', res.data.data);
    } catch (err) {
      console.log('get comment err: ', err);
      failedSnackbar('Something went wrong!');
    }
  };

  useEffect(() => {
    getProfileDetails();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      {!loading ? (
        <>
          {/* header */}
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              paddingVertical: 15,
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{paddingHorizontal: 10}}>
              <Icon name="arrow-left" size={22} color={'#fff'} />
            </TouchableOpacity>
            <View style={{flex: 1, paddingHorizontal: 5}}>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: '#fff',
                  fontSize: 18,
                  textAlign: 'left',
                }}>
                {profileData.username}
              </Text>
            </View>
          </View>
          {/* profile card */}
          <View
            style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
            <View style={{marginRight: 5}}>
              <Image
                source={
                  profileData.profile_picture != '' &&
                  profileData.profile_picture != null
                    ? {
                        uri: `${IMAGE_URL}${profileData.profile_picture}`,
                      }
                    : require('../assets/images/profile/noProfile.png')
                }
                style={{width: 80, height: 80, borderRadius: 50}}
              />
            </View>
            <View style={{flex: 1}}>
              <View style={{flexDirection: 'row'}}>
                <View style={{alignItems: 'center', flex: 1}}>
                  <Text
                    style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}>
                    {profileData.posts_count}
                  </Text>
                  <Text style={{fontSize: 12, color: 'grey'}}>posts</Text>
                </View>
                <View style={{alignItems: 'center', flex: 1}}>
                  <Text
                    style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}>
                    {profileData.followers_count}
                  </Text>
                  <Text style={{fontSize: 12, color: 'grey'}}>followers</Text>
                </View>
                <View style={{alignItems: 'center', flex: 1}}>
                  <Text
                    style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}>
                    {profileData.following_count}
                  </Text>
                  <Text style={{fontSize: 12, color: 'grey'}}>following</Text>
                </View>
              </View>
              {profileData.is_following == 1 ? (
                <TouchableOpacity
                  onPress={followAndUnfollow}
                  style={{
                    padding: 5,
                    backgroundColor: '#1A1A1A',
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#1A1A1A',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    marginHorizontal: 15,
                  }}>
                  <Text
                    style={{color: '#fff', fontSize: 12, fontWeight: '500'}}>
                    Unfollow
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={followAndUnfollow}
                  style={{
                    padding: 5,
                    backgroundColor: '#0095F6',
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#0095F6',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    marginHorizontal: 15,
                  }}>
                  <Text
                    style={{color: '#fff', fontSize: 12, fontWeight: '500'}}>
                    Follow
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* name and bio */}
          <View style={{padding: 10}}>
            <Text style={{color: '#fff'}}>{profileData.username}</Text>
            <Text style={{color: 'grey', fontSize: 12, marginTop: 2}}>
              {profileData.bio}
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              borderWidth: 0.2,
              borderColor: 'grey',
              marginTop: 15,
            }}
          />
          {/* Post List */}
          {postData.length > 0 ? (
            <FlatList
              data={postData}
              numColumns={3}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    style={{}}
                    onPress={() => {
                      setSelectedImage(`${IMAGE_URL}${item.post_image}`);
                      setViewImageModal(true);
                    }}>
                    <Image
                      source={{uri: `${IMAGE_URL}${item.post_image}`}}
                      style={{
                        width: windowWidth / 3,
                        height: 130,
                        borderWidth: 1,
                        borderColor: '#000',
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{color: '#fff', fontSize: 16}}>No posts yet!</Text>
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
    </SafeAreaView>
  );
};
export default CheckProfile;
