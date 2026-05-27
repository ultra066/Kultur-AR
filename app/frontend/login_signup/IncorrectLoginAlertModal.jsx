import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { alertModalStyles } from './_alert_modal_styles';

export default function IncorrectLoginAlertModal({ visible, onClose }) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={alertModalStyles.overlay}>
        <View style={alertModalStyles.modalCard}>
          <Text style={alertModalStyles.title}>Login Failed</Text>
          <Text style={alertModalStyles.message}>
            The password or email is incorrect.
          </Text>

          <TouchableOpacity style={alertModalStyles.okButton} onPress={onClose}>
            <Text style={alertModalStyles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

