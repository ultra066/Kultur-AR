import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/database/supabase';
import { useRouter } from 'expo-router';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const isStrongPassword = (pw) => {
    // at least 6 characters
    if (typeof pw !== 'string' || pw.length < 6) return false;

    // space aren't allowed
    if (/\s/.test(pw)) return false;

    // contains uppercase and lowercase
    if (!/[A-Z]/.test(pw)) return false;
    if (!/[a-z]/.test(pw)) return false;

    // contains at least 1 number
    if (!/[0-9]/.test(pw)) return false;

    // contains at least 1 special character
    // (anything that is not letter/number/underscore)
    if (!/[^A-Za-z0-9_]/.test(pw)) return false;

    return true;
  };

  const canSubmit = useMemo(() => {
    if (!currentPassword.trim()) return false;
    if (!newPassword) return false;
    if (!isStrongPassword(newPassword)) return false;
    if (confirmPassword !== newPassword) return false;
    return true;
  }, [currentPassword, newPassword, confirmPassword]);


  const handleSave = async () => {
    if (!canSubmit) {
      // Provide a specific password reason (newPassword rules)
      if (!newPassword || !isStrongPassword(newPassword)) {
        Alert.alert('Weak password', 'Must be 6+ chars, no spaces, include uppercase & lowercase, at least 1 number, and at least 1 special character.');
        return;
      }
      if (confirmPassword !== newPassword) {
        Alert.alert('Passwords do not match', 'Please ensure both passwords are identical.');
        return;
      }
      Alert.alert('Check fields', 'Please fill all fields correctly.');
      return;
    }


    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated. Please log in again.');

      // Supabase requires a re-auth. We do it by signing in again with current password.
      // This works when you know the user email from auth.
      const { email } = user;
      if (!email) throw new Error('User email not found.');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) throw signInError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      Alert.alert('Password updated', 'Your password has been changed successfully.');
      router.back();
    } catch (e) {
      Alert.alert('Error updating password', e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EFEFE5' }}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginRight: 10 }}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color="#6DA047" />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#000' }}>
            Change Password
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text style={{ color: '#888', fontWeight: '700', marginBottom: 6 }}>Current Password</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Enter current password"
            placeholderTextColor="#aaa"
            style={{
              borderWidth: 1,
              borderColor: '#eee',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 14,
              color: '#000',
            }}
          />

          <Text style={{ color: '#888', fontWeight: '700', marginBottom: 6 }}>New Password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Enter new password"
            placeholderTextColor="#aaa"
            style={{
              borderWidth: 1,
              borderColor: '#eee',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 14,
              color: '#000',
            }}
          />

          <Text style={{ color: '#888', fontWeight: '700', marginBottom: 6 }}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm new password"
            placeholderTextColor="#aaa"
            style={{
              borderWidth: 1,
              borderColor: '#eee',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 18,
              color: '#000',
            }}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: !canSubmit || loading ? '#b9d4aa' : '#6DA047',
              borderRadius: 14,
              paddingVertical: 12,
              alignItems: 'center',
              opacity: !canSubmit || loading ? 0.85 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '800' }}>SAVE</Text>
            )}
          </TouchableOpacity>

          <Text style={{ color: '#888', marginTop: 12, fontSize: 12 }}>
            Password must: no spaces, 6+ chars, upper+lower, 1 number, 1 special character.
          </Text>

        </View>
      </View>
    </SafeAreaView>
  );
}

