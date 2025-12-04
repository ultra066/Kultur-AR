import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Updated imports
import { Ionicons } from '@expo/vector-icons'; 

// 1. Import Supabase
import { supabase } from '../../../lib/database/supabase';
import { styles } from './signup_password_styles';

export default function SignupPasswordScreen() {
  const router = useRouter();
  
  // 2. Get params to pass forward
  const params = useLocalSearchParams();
  const { firstName, lastName } = params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const isMatch = password === confirmPassword;
  const showRedBorder = !isMatch && confirmPassword.length > 0;

  // --- 3. HANDLE NEXT (Set Password Logic) ---
  const handleNext = async () => {
    // Basic Validation
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (!isMatch) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    // Call Supabase to set the password for the currently logged-in user (from OTP step)
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", "Could not set password: " + error.message);
    } else {
      // Success! Move to Location setup
      router.push({
        pathname: '/frontend/login_signup/signup_location',
        params: { firstName, lastName } 
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <View style={styles.headerContainer} />
        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>Create your password</Text>

          {/* === Password Input Block === */}
          <View style={styles.inputContainer}>
            <View style={styles.inputTextWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible} 
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity 
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={isPasswordVisible ? "eye-off" : "eye"} 
                size={22} 
                color="#777" 
              />
            </TouchableOpacity>
          </View>

          {/* === Confirm Password Input Block === */}
          <View style={[
            styles.inputContainer, 
            showRedBorder && styles.inputError
          ]}>
             <View style={styles.inputTextWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isConfirmVisible}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity 
              onPress={() => setIsConfirmVisible(!isConfirmVisible)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={isConfirmVisible ? "eye-off" : "eye"} 
                size={22} 
                color="#777" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.nextButton, (!password || !isMatch || loading) && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!password || !isMatch || loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? "Setting Password..." : "Next"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/')}>
            <Text style={styles.footerText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}