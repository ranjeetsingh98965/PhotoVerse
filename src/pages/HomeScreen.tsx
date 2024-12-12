import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  Text,
  Touchable,
  TouchableOpacity,
  View,
  TextInput,
  BackHandler,
  RefreshControl,
  Platform,
  ToastAndroid,
  Pressable,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import {ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import successSnackbar from '../components/SnackBars/successSnackbar';
import failedSnackbar from '../components/SnackBars/failedSnackbar';
import RNFetchBlob from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL, IMAGE_URL} from '@env';
import RNFS from 'react-native-fs';
import LottieView from 'lottie-react-native';
import {LazyLoadImage} from 'react-native-lazy-load-image';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [commentModal, setCommentModal] = useState(false);
  const [commentsMessage, setCommentsMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [viewImageModal, setViewImageModal] = useState(false);
  const [downloadImgLoading, setDownloadImgLoading] = useState(false);
  const [commentData, setCommentData] = useState([]);
  const [commentDataLoading, setCommentDataLoading] = useState(false);
  const [addcommentLoading, setAddCommentLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [allPostData, setAllPostData] = useState([]);
  const [selectedPost, setSelectedPost] = useState({});
  const [feedLoading, setFeedLoading] = useState(true);
  const [likeLottieVisible, setLikeLottieVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const [backPressedOnce, setBackPressedOnce] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (backPressedOnce) {
        BackHandler.exitApp();
      } else {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        setBackPressedOnce(true);
        setTimeout(() => {
          setBackPressedOnce(false);
        }, 2000);
        return true;
      }
    };

    // Add the back handler
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Cleanup the back handler when the component is unmounted
    return () => backHandler.remove();
  }, [backPressedOnce]);

  const downloadImage = async (imageUrl, imageName) => {
    setDownloadImgLoading(true);
    // console.log('Downloading Image: ', imageUrl, ' , ', imageName);
    const {config, fs} = RNFetchBlob;
    const downloadDir =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.DownloadDirectoryPath;
    const imagePath = `${downloadDir}/${imageName}.jpg`;

    try {
      const res = await config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: imagePath,
          description: 'Downloading image file.',
          mime: 'image/jpeg',
          mediaScannable: true,
        },
      }).fetch('GET', imageUrl);

      // console.log('Image Downloaded:', res.path());
      setDownloadImgLoading(false);
      successSnackbar('Image Downloaded.');
    } catch (error) {
      console.error('Error downloading image:', error);
      setDownloadImgLoading(false);
      failedSnackbar('Download Failed!');
    }
  };

  const getPostData = async () => {
    setFeedLoading(true);
    try {
      const user_id = await AsyncStorage.getItem('userId');
      const data = {
        user_id: user_id,
      };

      let res = await axios.post(`${BASE_URL}feed`, data);
      console.log('get post res: ', res.data.data['user_details'][0]);
      if (res.data.status) {
        setUserData(res.data.data['user_details'][0]);
        setAllPostData(res.data.data['feed_data']);
        setFeedLoading(false);
      } else {
        failedSnackbar('Something went wrong!');
        setFeedLoading(false);
      }
    } catch (err) {
      console.log('get post data err: ', err);
      setFeedLoading(false);
      failedSnackbar('Something went wrong!');
    }
  };

  const getPostComments = async post_id => {
    setCommentDataLoading(true);
    try {
      const user_id = await AsyncStorage.getItem('userId');
      const data = {
        user_id: user_id,
        post_id: post_id,
      };
      console.log('get comment data: ', data);
      let res = await axios.post(`${BASE_URL}show_comments`, data);
      console.log('get comment res: ', res.data.data['comments']);
      if (res.data.status == true) {
        setCommentData(res.data.data['comments']);
      } else {
        failedSnackbar('Something went wrong!');
      }
      setCommentDataLoading(false);
    } catch (err) {
      console.log('get comment err: ', err);
      failedSnackbar('Something went wrong!');
      setCommentDataLoading(false);
    }
  };

  const addComment = async () => {
    setAddCommentLoading(true);
    try {
      const user_id = await AsyncStorage.getItem('userId');
      const data = {
        user_id: user_id,
        post_id: selectedPost.post_id,
        comment: commentsMessage,
      };
      let res = await axios.post(`${BASE_URL}insert_comment`, data);
      console.log('add comment res: ', res.data);
      if (res.data.status) {
        const newId = (commentData.length + 1).toString();
        const newCreatedAt = new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');
        const newCommentData = {
          id: newId,
          post_id: selectedPost.post_id,
          user_id: user_id,
          comment: commentsMessage,
          username: userData.username,
          profile_picture: userData.profile_picture,
          created_at: newCreatedAt,
        };
        setCommentData([newCommentData, ...commentData]);
        setCommentsMessage('');
      } else {
        failedSnackbar('Something went wrong!');
      }
      setAddCommentLoading(false);
    } catch (err) {
      console.log('add comment err: ', err);
      setAddCommentLoading(false);
      failedSnackbar('Something went wrong!');
    }
  };

  const addAndRemoveLike = async post_id => {
    try {
      const user_id = await AsyncStorage.getItem('userId');
      const post = allPostData.find(p => p.post_id === post_id);
      const updatedPostData = allPostData.map(item =>
        item.post_id === post_id
          ? {
              ...item,
              likes: item.likes === '1' ? '0' : '1',
              likes_count:
                item.likes === '1'
                  ? (parseInt(item.likes_count) - 1).toString()
                  : (parseInt(item.likes_count) + 1).toString(),
            }
          : item,
      );

      setAllPostData(updatedPostData);

      const data = {
        user_id: user_id,
        post_id: post_id,
        like: post.likes == '1' ? 0 : 1,
      };

      // console.log('data: ', data);
      let res = await axios.post(`${BASE_URL}insert_and_delete_like`, data);
      // console.log('Like response: ', res.data);
    } catch (err) {
      console.log('Error liking/unliking post: ', err);
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
    getPostData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getPostData();
      setRefreshing(false);
    }, 1500);
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);

    const options = {month: 'short', day: 'numeric', year: 'numeric'};
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      <StatusBar
        backgroundColor={'#000'}
        animated={true}
        barStyle={'light-content'}
        hidden={false}
      />
      {/* Header */}
      <View
        style={{
          backgroundColor: '#000',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          paddingVertical: 2,
        }}>
        <View
          style={{
            width: 100,
            height: 40,
            alignItems: 'flex-start',
          }}>
          <Image
            source={require('../assets/images/logo_name.png')}
            style={{width: '100%', height: '100%', tintColor: '#fff'}}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            ToastAndroid.show('Coming Soon', ToastAndroid.SHORT);
          }}>
          <Icon name="message-text" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {!feedLoading ? (
        <>
          {/* Feed Card start */}
          {allPostData.length > 0 ? (
            <FlatList
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              data={allPostData}
              renderItem={({item}) => {
                return (
                  <View style={{marginTop: 4}}>
                    {/* card header */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                      }}>
                      <TouchableOpacity
                        onPress={() => checkUserProfile(item.user_id)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Image
                          source={
                            item.profile_picture != '' &&
                            item.profile_picture != null
                              ? {
                                  uri: `${IMAGE_URL}${item.profile_picture}`,
                                }
                              : require('../assets/images/profile/noProfile.png')
                          }
                          style={{width: 35, height: 35, borderRadius: 50}}
                          resizeMode="cover"
                        />
                        <View style={{marginHorizontal: 10, width: '80%'}}>
                          <Text
                            style={{fontWeight: 'bold', color: '#fff'}}
                            numberOfLines={1}>
                            {item.username}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View>
                        <Icon name="dots-vertical" size={20} color={'#fff'} />
                      </View>
                    </View>

                    {/* image */}
                    <View>
                      {selectedPost.post_id == item.post_id &&
                      likeLottieVisible ? (
                        <View
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            zIndex: 99,
                            width: '100%',
                            height: (windowHeight * 30) / 100,
                          }}>
                          <LottieView
                            source={require('../assets/lottie/heart.json')}
                            resizeMode="contain"
                            loop={false}
                            speed={2}
                            style={{width: 250, height: 250}}
                            autoPlay={true}
                            onAnimationFinish={() => {
                              console.log('Animation Finished');
                              setLikeLottieVisible(false);
                            }}
                          />
                        </View>
                      ) : null}

                      <Pressable
                        onPress={() => {
                          setSelectedImage(item.post_img);
                          setViewImageModal(true);
                          setSelectedPost(item);
                        }}
                        style={{
                          // width: '100%',
                          // height: (windowHeight * 30) / 100,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        {/* <Image
                          source={{uri: `${IMAGE_URL}${item.post_image}`}}
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#000',
                          }}
                          resizeMode="contain"
                        /> */}
                        <LazyLoadImage
                          source={{uri: `${IMAGE_URL}${item.post_image}`}}
                          style={{
                            width: windowWidth,
                            height: (windowHeight * 30) / 100,
                            backgroundColor: '#000',
                          }}
                          color={'#fff'}
                          resizeMode="contain"
                        />
                      </Pressable>
                    </View>

                    {/* card footer */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity
                          disabled={likeLottieVisible ? true : false}
                          onPress={() => {
                            setSelectedPost(item);
                            if (item.likes == '0') {
                              setLikeLottieVisible(true);
                            }
                            addAndRemoveLike(item.post_id);
                          }}>
                          {item.likes == '1' ? (
                            <Icon name="heart" size={24} color={'red'} />
                          ) : (
                            <Icon
                              name="heart-outline"
                              size={24}
                              color={'#fff'}
                            />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{paddingHorizontal: 15}}
                          onPress={() => {
                            setSelectedPost(item);
                            getPostComments(item.post_id);
                            setCommentData([]);
                            setCommentModal(true);
                          }}>
                          <Icon
                            name="message-reply-text"
                            size={24}
                            color={'#fff'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            ToastAndroid.show('Coming Soon', ToastAndroid.SHORT)
                          }>
                          <Icon name="share-variant" size={24} color={'#fff'} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        disabled={downloadImgLoading ? true : false}
                        onPress={() => {
                          setSelectedPost(item);
                          downloadImage(
                            `${IMAGE_URL}${item.post_image}`,
                            `${item.username}_post`,
                          );
                        }}>
                        {downloadImgLoading &&
                        selectedPost.post_id == item.post_id ? (
                          <ActivityIndicator size={20} color="#fff" />
                        ) : (
                          <Icon
                            name="tray-arrow-down"
                            size={24}
                            color={downloadImgLoading ? 'grey' : '#fff'}
                          />
                        )}
                        {/* <Icon name="tray-arrow-down" size={24} color={'#fff'} /> */}
                      </TouchableOpacity>
                    </View>

                    {/* card sub footer */}
                    <View style={{paddingHorizontal: 10}}>
                      <Text style={{color: '#fff', fontSize: 13}}>
                        {item.likes_count} likes
                      </Text>
                      {item.caption != '' && item.caption != null ? (
                        <Text
                          style={{
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: 14,
                          }}>
                          {item.username}{' '}
                          <Text
                            style={{
                              fontWeight: 'normal',
                              color: '#fff',
                              fontSize: 14,
                            }}>
                            {item.caption}
                          </Text>
                        </Text>
                      ) : null}

                      {item.comments_count != '0' ? (
                        <Text
                          onPress={() => setCommentModal(true)}
                          style={{
                            color: '#D9E1E6',
                            fontSize: 12,
                            marginTop: 2,
                          }}>
                          View all {item.comments_count} comments
                        </Text>
                      ) : null}

                      <Text
                        style={{
                          color: '#D9E1E6',
                          fontSize: 10,
                          marginTop: 2,
                          marginBottom: 10,
                        }}>
                        {item.post_publish_date}
                      </Text>
                    </View>
                  </View>
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
                No posts yet? Discover amazing content by following more users!
              </Text>
            </View>
          )}

          {/* Feed Card end */}
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Comment Modal */}
      <Modal
        visible={commentModal}
        animationType="slide"
        onRequestClose={() => setCommentModal(false)}>
        <View style={{flex: 1, backgroundColor: '#000'}}>
          {/* comment Header */}
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              paddingVertical: 15,
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => setCommentModal(false)}
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
          </View>

          {!commentDataLoading ? (
            <>
              {commentData.length > 0 ? (
                <>
                  {/* list of comments */}

                  <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{flex: 1}}
                    data={commentData}
                    renderItem={({item}) => {
                      return (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 10,
                            marginTop: 20,
                          }}>
                          <View
                            style={{
                              height: '100%',
                              justifyContent: 'flex-start',
                            }}>
                            <Image
                              source={
                                userData &&
                                userData.profile_picture != '' &&
                                userData.profile_picture != null
                                  ? {
                                      uri: `${IMAGE_URL}${userData.profile_picture}`,
                                    }
                                  : require('../assets/images/profile/noProfile.png')
                              }
                              style={{width: 40, height: 40, borderRadius: 50}}
                            />
                          </View>
                          <View style={{flex: 1, marginHorizontal: 10}}>
                            <Text style={{color: '#fff', fontWeight: 'bold'}}>
                              {item.username}
                              {'  '}
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: 'grey',
                                  marginTop: 2,
                                }}>
                                {formatDate(item.created_at)}
                              </Text>
                            </Text>
                            <Text
                              style={{
                                color: '#fff',
                                fontWeight: 'normal',
                                marginTop: 2,
                              }}>
                              {item.comment}
                            </Text>
                          </View>
                          {/* <View>
                            <Icon name="cards-heart" color={'#fff'} size={20} />
                          </View> */}
                        </View>
                      );
                    }}
                  />
                </>
              ) : (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    backgroundColor: '#000',
                  }}>
                  <Text
                    style={{fontSize: 20, color: '#fff', fontWeight: 'bold'}}>
                    No Comments yet
                  </Text>
                  <Text style={{fontSize: 14, color: '#F0F0F0', marginTop: 5}}>
                    Start the conversation.
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 10,
                  alignItems: 'center',
                  paddingVertical: 5,
                }}>
                <View>
                  <Image
                    source={
                      userData &&
                      userData.profile_picture != '' &&
                      userData.profile_picture != null
                        ? {
                            uri: `${IMAGE_URL}${userData.profile_picture}`,
                          }
                        : require('../assets/images/profile/noProfile.png')
                    }
                    style={{width: 35, height: 35, borderRadius: 50}}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    marginHorizontal: 10,
                  }}>
                  <TextInput
                    placeholder="write your comment here..."
                    placeholderTextColor={'grey'}
                    style={{color: '#fff'}}
                    onChangeText={txt => setCommentsMessage(txt)}
                    value={commentsMessage}
                  />
                </View>
                <TouchableOpacity
                  disabled={
                    commentsMessage == '' ||
                    commentsMessage == null ||
                    addcommentLoading
                      ? true
                      : false
                  }
                  onPress={() => {
                    addComment();
                  }}>
                  {!addcommentLoading ? (
                    <Text style={{color: '#0095F6', fontWeight: 'bold'}}>
                      POST
                    </Text>
                  ) : (
                    <ActivityIndicator size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </View>
      </Modal>

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
                url: `${IMAGE_URL}${selectedPost.post_image}`,
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
export default HomeScreen;

// const data = {
//   user_details: {
//     username: 'dark',
//     profile_pic: '',
//     id: 17,
//   },
//   feed_data: [
//     {
//       user_id:17,
//       profile_picture:'',
//       post_image:'',
//       caption: '',
//       likes:40,
//       post_publish_date: 'Sept 7, 2024'

//     },
//     {...},
//   ]
// }
