import Snackbar from 'react-native-snackbar';

export default function failedSnackbar(message: any) {
  return Snackbar.show({
    text: message,
    numberOfLines: 4,
    duration: Snackbar.LENGTH_LONG,
    backgroundColor: '#FE6969',
    textColor: '#fff',
    action: {
      text: 'Cancel',
      textColor: '#fff',
      onPress: () => Snackbar.dismiss,
    },
  });
}
