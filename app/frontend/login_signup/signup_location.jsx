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
import { useRouter } from 'expo-router';
import RegionProvinceSelector from '../components/RegionProvinceSelector';
import CountrySelector from '../components/CountrySelector';
import { Ionicons } from '@expo/vector-icons'; 

import { styles } from './signup_location_styles';

export default function SignupLocationScreen() {
  const router = useRouter();
  
  // State for selection: 'filipino' | 'foreigner' | null
  const [userOrigin, setUserOrigin] = useState(null);

  // Handlers for "Mock" Dropdowns (Since you asked for selection input, not type)
  const handleSelectCountry = () => Alert.alert("Selection", "Country list would appear here");

  const handleFinish = () => {
    if (!userOrigin) return;
    
    if (userOrigin === 'filipino') {
      // Logic for Filipino flow end
      console.log("Filipino Setup Complete");
      router.push('/dashboard'); // Assuming you have a dashboard
    } else {
      // Logic for Foreigner flow next step
      console.log("Foreigner Next Step");
      router.push('/dashboard'); // Or next foreigner page
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
            <TouchableOpacity style={styles.mainButton} onPress={handleFinish}>
              <Text style={styles.mainButtonText}>
                {userOrigin === 'filipino' ? "GET STARTED" : "Next"}
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