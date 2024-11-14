import firebase from '@react-native-firebase/app';

const firebaseConfig = {
  projectId: 'photoverse-1f3e6',
  messagingSenderId: '712618346488',
  appId: '1:712618346488:android:850052956caef0bac5f80d',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
