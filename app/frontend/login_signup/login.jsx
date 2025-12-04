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

// 1. IMPORT SUPABASE
import { supabase } from '../../../lib/database/supabase';
import { styles } from './login_styles'; 

export default function LoginScreen() {
  const router = useRouter(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  // --- 2. LOGIN FUNCTION ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Call Supabase Authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login Failed", error.message);
    } else {
      // Success! Go to Home Page
      // Use 'replace' so they can't go back to login by swiping
      router.replace('/frontend/homepage/home'); 
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
          
          <Text style={styles.title}>
            Sign in to your{'\n'}account
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* 3. CONNECT BUTTON TO FUNCTION */}
          <TouchableOpacity 
            style={[styles.signInButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
              <Text style={styles.optionsText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.optionsText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or sign in with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.socialIconWrapper}>
                 <Text style={styles.socialIconText}>G</Text>
                 <Text style={styles.socialButtonText}>Google</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              <View style={styles.socialIconWrapper}>
                 <Text style={[styles.socialIconText, styles.socialIconFacebook]}>f</Text>
                 <Text style={styles.socialButtonText}>facebook</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.createAccountButton}
            onPress={() => router.push('/frontend/login_signup/signup')}
          >
            <Text style={styles.createAccountText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}