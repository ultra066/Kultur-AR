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

import { styles } from './signup_styles';

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // VALIDATION FUNCTION
  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Missing Information", "Please enter both First Name and Last Name to proceed.");
      return;
    }
    
    // If valid, proceed to email signup
    console.log("Validation Passed!", firstName, lastName);
    router.push('/frontend/login_signup/signup_email');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        <View style={styles.headerContainer} />

        <View style={styles.cardContainer}>
          
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>What’s your name?</Text>

          {/* First Name Input (Updated to match Login style) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          {/* Last Name Input (Updated to match Login style) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          {/* Next Button with Validation */}
          <TouchableOpacity 
            style={[
               styles.nextButton, 
               (!firstName || !lastName) && styles.nextButtonDisabled // Optional: visually grey it out
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>

          {/* Footer Sign In Link */}
          <TouchableOpacity 
            style={styles.footerLink}
            onPress={() => router.push('/frontend/login_signup')}
          >
            <Text style={styles.footerText}>SIGN IN</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}