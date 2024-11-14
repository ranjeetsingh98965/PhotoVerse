import Snackbar from 'react-native-snackbar';

export default function warningSnackbar(message: any) {
  return Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_LONG,
    numberOfLines: 4,
    backgroundColor: '#FFAC00',
    textColor: '#fff',
    action: {
      text: 'Cancel',
      textColor: '#fff',
      onPress: () => Snackbar.dismiss,
    },
  });
}
