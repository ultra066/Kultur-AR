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
  Modal 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Added useLocalSearchParams

// 1. Import Supabase Client
import { supabase } from '../../../lib/database/supabase';
import { styles } from './signup_styles';

export default function SignupEmailScreen() {
  const router = useRouter();
  
  // 2. Get data passed from the Name screen
  const params = useLocalSearchParams();
  const { firstName, lastName } = params;

  const [email, setEmail] = useState('');
  
  // MODAL & OTP STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(100);
  const [loading, setLoading] = useState(false); // Added loading state

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

  // --- SEND OTP LOGIC ---
  const handleNext = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // Send the OTP code via Email
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: true } 
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error sending code", error.message);
    } else {
      // Success: Open the OTP Modal
      setModalVisible(true);
      setTimer(100); 
    }
  };

  // --- RESEND LOGIC ---
  const handleRetry = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: true } 
    });
    setLoading(false);

    if (error) {
       Alert.alert("Error", error.message);
    } else {
       setTimer(100);
       setOtp(''); 
       Alert.alert("Sent", "New code sent to your email.");
    }
  };

  // --- VERIFY OTP LOGIC ---
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Code must be 6 digits.");
      return;
    }
    
    setLoading(true);

    // Check if the code matches
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    });

    setLoading(false);

    if (error) {
      Alert.alert("Verification Failed", "Invalid code or expired.");
    } else {
      setModalVisible(false);
      
      // Success! Go to Password Page
      // We pass the Name info forward so we can save the full profile later
      router.push({
        pathname: '/frontend/login_signup/signup_password',
        params: { firstName, lastName } 
      });
    }
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
              style={[styles.nextButton, (!email || loading) && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.nextButtonText}>
                {loading ? "Sending..." : "Next"}
              </Text>
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
              We sent you an email, please check your inbox and complete the OTP Code
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
              style={[styles.nextButton, (otp.length < 6 || loading) && styles.nextButtonDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading || timer === 0}
            >
              <Text style={styles.nextButtonText}>
                {loading ? "Verifying..." : "Next"}
              </Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}