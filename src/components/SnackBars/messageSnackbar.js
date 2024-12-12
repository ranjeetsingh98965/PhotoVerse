import Snackbar from 'react-native-snackbar';

export default function messageSnackbar(message: any) {
  return Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_INDEFINITE,
    numberOfLines: 4,
    backgroundColor: '#fff',
    textColor: '#000',
    action: {
      text: 'Cancel',
      textColor: '#000',
      onPress: () => Snackbar.dismiss,
    },
  });
}
