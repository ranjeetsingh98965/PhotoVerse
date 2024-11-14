import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  BackHandler,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NotificationScreen = () => {
  const navigation = useNavigation();

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

  const notificationData = [
    {
      id: 1,
      user_name: 'Happy',
      role: 'liked your post: ',
      comment: '🔥🔥🔥',
      date: 'Aug 15, 2024',
      profile_img:
        'https://images.pexels.com/photos/14620969/pexels-photo-14620969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 2,
      user_name: 'Liza',
      role: 'started following you.',
      comment: '',
      date: 'Aug 19, 2024',
      profile_img:
        'https://images.pexels.com/photos/19369690/pexels-photo-19369690/free-photo-of-smiling-woman-in-hat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
  ];

  const suggestedData = [
    {
      id: 1,
      user_name: 'Happy',
      bio: 'Artist',
      profile_img:
        'https://images.pexels.com/photos/14620969/pexels-photo-14620969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 2,
      user_name: 'Liza',
      bio: 'Designer',
      profile_img:
        'https://images.pexels.com/photos/19369690/pexels-photo-19369690/free-photo-of-smiling-woman-in-hat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
  ];
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
            Notifications
          </Text>
        </View>
      </View>

      <ScrollView>
        {/* notification card */}
        {notificationData.map(item => {
          return (
            <View
              style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
              <View>
                <Image
                  source={{
                    uri: item.profile_img,
                  }}
                  style={{width: 40, height: 40, borderRadius: 50}}
                  resizeMode="cover"
                />
              </View>
              <View style={{flex: 1, marginHorizontal: 10}}>
                <View>
                  <Text style={{fontWeight: 'bold', color: '#fff'}}>
                    {item.user_name}{' '}
                    <Text
                      style={{
                        fontWeight: 'normal',
                        color: '#fff',
                        fontSize: 12,
                      }}>
                      {item.role} <Text>{item.comment}</Text>
                    </Text>
                  </Text>
                </View>
                <View>
                  <Text style={{fontSize: 11, color: 'grey'}}>{item.date}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* suggestion card */}

        <View style={{marginTop: 25, marginBottom: 10}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
            Suggested for you
          </Text>
        </View>
        {suggestedData.map(item => {
          return (
            <View
              style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
              <View>
                <Image
                  source={{
                    uri: item.profile_img,
                  }}
                  style={{width: 40, height: 40, borderRadius: 50}}
                  resizeMode="cover"
                />
              </View>
              <View style={{flex: 1, marginHorizontal: 10}}>
                <View>
                  <Text style={{fontWeight: 'bold', color: '#fff'}}>
                    {item.user_name}
                  </Text>
                </View>
                <View>
                  <Text style={{fontSize: 14, color: 'grey'}}>{item.bio}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#0095F6',
                  borderRadius: 4,
                  padding: 5,
                  paddingHorizontal: 10,
                }}>
                <Text style={{color: '#fff'}}>Follow</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
export default NotificationScreen;
