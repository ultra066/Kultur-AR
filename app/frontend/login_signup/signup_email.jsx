import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal // 1. Import Modal
} from 'react-native';
import { useRouter } from 'expo-router';

import { styles } from './signup_styles';

export default function SignupEmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  
  // MODAL & OTP STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(100);

  // TIMER LOGIC
  useEffect(() => {
    let interval;
    if (modalVisible && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [modalVisible, timer]);

  const handleNext = () => {
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    // Open the OTP Modal
    setModalVisible(true);
    setTimer(100); // Reset timer just in case
  };

  const handleRetry = () => {
    setTimer(100);
    setOtp(''); // Clear input
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Code must be 6 digits.");
      return;
    }
    
    setModalVisible(false);
    
    // NAVIGATION UPDATE: Point to the new file location
    router.push('/frontend/login_signup/signup_password');
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          
          {/* Header */}
          <View style={styles.headerContainer} />

          {/* Card */}
          <View style={styles.cardContainer}>
            
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.subtitle}>What’s your Email Address?</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.helperText}>
              You will receive an email for verification.
            </Text>

            <TouchableOpacity 
              style={[styles.nextButton, !email && styles.nextButtonDisabled]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/frontend/login_signup')}>
              <Text style={styles.footerText}>SIGN IN</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* === THE OTP BOTTOM SHEET MODAL === */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Android Back Button
      >
        {/* Dimmed Background (Click to close) */}
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          {/* White Card Content (Stop click propagation) */}
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.modalContent} 
            onPress={() => {}} // Prevents closing when clicking inside card
          >
            {/* Grey Handle */}
            <View style={styles.modalHandle} />

            <Text style={styles.title}>Email Confirmation</Text>
            <Text style={styles.subtitle}>Confirm your Email Address</Text>

            {/* OTP Input */}
            <View style={[
              styles.otpInputContainer, 
              timer === 0 && { backgroundColor: '#ddd' } // Visual cue that it's disabled
            ]}>
              <Text style={styles.inputLabel}>OTP Code</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={(text) => {
                  // Only allow numbers and max 6 digits
                  if (/^\d*$/.test(text) && text.length <= 6) {
                    setOtp(text);
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
                editable={timer > 0} // DISABLES INPUT IF TIMER IS 0
                placeholder={timer === 0 ? "Time expired" : "123456"}
              />
            </View>

            <Text style={{ textAlign: 'center', paddingHorizontal: 20, marginBottom: 10, color: '#555' }}>
              We send you email, please check your email and complete the OTP Code
            </Text>

            {/* Timer or Retry Logic */}
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Didn’t Receive code? Resend - <Text style={{fontWeight: 'bold'}}>{timer}s</Text>
              </Text>
            ) : (
              // Retry Button (Only appears when timer is 0)
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryText}>↻ Tap here to Retry</Text>
              </TouchableOpacity>
            )}

            {/* Next Button (Inside Modal) */}
            <TouchableOpacity 
              style={[styles.nextButton, (otp.length < 6 || timer === 0) && styles.nextButtonDisabled]}
              onPress={handleVerifyOtp}
              disabled={timer === 0}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}