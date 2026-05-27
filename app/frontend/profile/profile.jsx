import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/database/supabase';
import { useRouter } from 'expo-router';

const formatField = (v) => {
  if (v === null || v === undefined) return '';
  return String(v);
};

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated. Please log in again.');

        // Assumes profiles.id == auth.users.id (as used during signup)
        const { data, error } = await supabase
          .from('profiles')
          .select(
            'first_name, middle_name, last_name, suffix, origin_type, region, province, country'
          )
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (e) {
        setErrorMsg(e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const fullName = (() => {
    const first = formatField(profile?.first_name);
    const middle = formatField(profile?.middle_name);
    const last = formatField(profile?.last_name);
    const suffix = formatField(profile?.suffix);

    const parts = [first, middle].filter(Boolean);
    const main = [...parts, last].filter(Boolean).join(' ');
    return suffix ? `${main}, ${suffix}` : main;
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EFEFE5' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginRight: 10 }}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color="#6DA047" />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#000' }}>Profile</Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6DA047" />
          </View>
        ) : errorMsg ? (
          <View style={{ paddingVertical: 30 }}>
            <Text style={{ color: '#b00020', fontWeight: '600' }}>{errorMsg}</Text>
          </View>
        ) : (
          <>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    borderWidth: 2,
                    borderColor: '#6DA047',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="person" size={26} color="#6DA047" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
                    {fullName || '—'}
                  </Text>
                  <Text style={{ color: '#888', marginTop: 4 }}>
                    {profile?.origin_type ? `Nationality: ${profile.origin_type}` : '—'}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <DetailRow label="First Name" value={formatField(profile?.first_name) || '—'} />
              <DetailRow label="Middle Name" value={formatField(profile?.middle_name) || '—'} />
              <DetailRow label="Last Name" value={formatField(profile?.last_name) || '—'} />
              <DetailRow label="Suffix" value={formatField(profile?.suffix) || '—'} />
              <DetailRow label="Nationality (origin_type)" value={formatField(profile?.origin_type) || '—'} />
              <DetailRow label="Region" value={formatField(profile?.region) || '—'} />
              <DetailRow label="Province" value={formatField(profile?.province) || '—'} />
              <DetailRow label="Country" value={formatField(profile?.country) || '—'} />

              <TouchableOpacity
                onPress={() => router.push('/frontend/profile/change_password')}
                activeOpacity={0.85}
                style={{
                  marginTop: 18,
                  backgroundColor: '#6DA047',
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel="Change password"
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>CHANGE PASSWORD</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value }) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text style={{ color: '#888', fontWeight: '600', flex: 0.55 }}>{label}</Text>
      <Text style={{ color: '#000', fontWeight: '500', flex: 0.45, textAlign: 'right' }}>{value}</Text>
    </View>
  );
};

