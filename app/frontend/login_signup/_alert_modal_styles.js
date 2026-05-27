import { StyleSheet } from 'react-native';

export const alertModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#f2f0e9',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2dfd2',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  okButton: {
    alignSelf: 'stretch',
    backgroundColor: '#b3cf5f',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});

