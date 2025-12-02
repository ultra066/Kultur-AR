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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

import { styles } from './signup_password_styles';

export default function SignupPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const isMatch = password === confirmPassword;
  const showRedBorder = !isMatch && confirmPassword.length > 0;

  const handleNext = () => {
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (!isMatch) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    router.push('/frontend/login_signup/signup_location');
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
            
            {/* 1. WRAPPER: Holds Label and Input stacked vertically */}
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
            
            {/* 2. ICON: Sits to the right of the wrapper */}
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
             
             {/* 1. WRAPPER */}
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

            {/* 2. ICON */}
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
            style={[styles.nextButton, (!password || !isMatch) && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!password || !isMatch}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/')}>
            <Text style={styles.footerText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}