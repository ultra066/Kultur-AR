import React, { useState } from 'react';
import {
  View,
  Text,
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
import RegionProvinceSelector from '../components/RegionProvinceSelector';
import CountrySelector from '../components/CountrySelector';
import { styles } from './signup_location_styles';

export default function SignupLocationScreen() {
  const router = useRouter();
  
  // 2. Get params passed from previous screens (Name)
  const params = useLocalSearchParams();
  const { firstName, lastName } = params;

  // State for selection: 'filipino' | 'foreigner' | null
  const [userOrigin, setUserOrigin] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // These states would ideally be lifted up from the child components
  // For now, we assume simple selection just for the profile 'type'
  
  // --- 3. HANDLE FINISH (Save Profile) ---
  const handleFinish = async () => {
    if (!userOrigin) return;

    setLoading(true);

    try {
      // A. Get the current authenticated user (from the OTP step)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found. Please log in again.");
      }

      // B. Update the 'profiles' table
      // The trigger already created the row, so we just update it.
      const updates = {
        id: user.id,
        first_name: firstName || '',
        last_name: lastName || '',
        origin_type: userOrigin,
        // You can add region/country here if you pass it from the child components
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      // C. Success! Redirect to Dashboard
      // Use 'replace' to prevent going back to signup
      router.replace('/frontend/homepage/home');

    } catch (error) {
      Alert.alert("Error saving profile", error.message);
    } finally {
      setLoading(false);
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
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>Where are you come from?</Text>

          {/* === SELECTION BOX === */}
          <View style={styles.selectionBox}>
            <Text style={styles.selectionLabel}>Are you a?</Text>

            {/* Option 1: Filipino */}
            <TouchableOpacity 
              style={styles.radioRow} 
              onPress={() => setUserOrigin('filipino')}
            >
              <Text style={styles.radioText}>Filipino</Text>
              <View style={styles.radioOuter}>
                {userOrigin === 'filipino' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Option 2: Foreigner */}
            <TouchableOpacity 
              style={styles.radioRow} 
              onPress={() => setUserOrigin('foreigner')}
            >
              <Text style={styles.radioText}>Foreigner</Text>
              <View style={styles.radioOuter}>
                {userOrigin === 'foreigner' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>


          {/* === CONDITIONAL INPUTS === */}
          
          {/* IF FILIPINO: Show Region & Province */}
          {userOrigin === 'filipino' && (
            <RegionProvinceSelector />
          )}

          {/* IF FOREIGNER: Show Country */}
          {userOrigin === 'foreigner' && (
            <CountrySelector />
          )}

          {/* === DYNAMIC BUTTON === */}
          {/* Only show button if a selection is made */}
          {userOrigin && (
            <TouchableOpacity 
              style={[styles.mainButton, loading && { opacity: 0.7 }]} 
              onPress={handleFinish}
              disabled={loading}
            >
              <Text style={styles.mainButtonText}>
                {loading ? "SAVING..." : (userOrigin === 'filipino' ? "GET STARTED" : "Next")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/')}>
            <Text style={styles.footerText}>SIGN IN</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}