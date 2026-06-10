import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/database/supabase';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer'; // Make sure to install this package

const formatField = (v) => {
  if (v === null || v === undefined) return '';
  return String(v);
};

const BUCKET_NAME = 'KulturAR-assets';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        setUploadError('');
        setImageUrl(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated. Please log in again.');

        const { data, error } = await supabase
          .from('profiles')
          .select(
            'id, image, first_name, middle_name, last_name, suffix, origin_type, region, province, country'
          )
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);

        if (data?.image) {
          // `profiles.image` is expected to store the public URL.
          setImageUrl(data.image);
        }
      } catch (e) {
        setErrorMsg(e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const fullName = useMemo(() => {
    const first = formatField(profile?.first_name);
    const middle = formatField(profile?.middle_name);
    const last = formatField(profile?.last_name);
    const suffix = formatField(profile?.suffix);

    const parts = [first, middle].filter(Boolean);
    const main = [...parts, last].filter(Boolean).join(' ');
    return suffix ? `${main}, ${suffix}` : main;
  }, [profile]);

  const extFromMime = (ct) => {
    if (!ct) return 'jpg';
    const m = String(ct).toLowerCase();
    if (m.includes('png')) return 'png';
    if (m.includes('webp')) return 'webp';
    if (m.includes('jpeg') || m.includes('jpg')) return 'jpg';
    return 'jpg';
  };

  // Store into bucket(KulturAR-assets)/PROFILES/<userId>.<ext>
  const objectKeyForUser = (userId, ext) => `PROFILES/${userId}.${ext}`;

  const handlePickAndUpload = async () => {
    setUploadError('');

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setUploadError(userError?.message || 'Failed to get user');
      return;
    }
    if (!user) {
      setUploadError('Not authenticated. Please log in again.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setUploadError('Media library permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true, // Crucial: Request base64 data to bypass React Native fetch/blob issues
    });

    if (result.canceled) return;
    const picked = result.assets?.[0];
    
    if (!picked?.uri || !picked?.base64) {
      setUploadError('No image selected.');
      return;
    }

    try {
      setUploading(true);

      const contentType = picked.mimeType || 'image/jpeg';
      const ext = extFromMime(contentType);
      const key = objectKeyForUser(user.id, ext);

      // Upload the decoded base64 string directly to Supabase Storage
      const { error: uploadStorageError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(key, decode(picked.base64), {
          upsert: true,
          contentType,
          cacheControl: '3600',
        });

      if (uploadStorageError) {
        const details = JSON.stringify(
          {
            name: uploadStorageError?.name,
            statusCode: uploadStorageError?.statusCode,
            message: uploadStorageError?.message,
            bucket: BUCKET_NAME,
            key,
            contentType,
          },
          null,
          2
        );

        throw new Error(
          `Upload failed: ${uploadStorageError.message ?? String(uploadStorageError)}\n${details}`
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(key);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Upload succeeded but could not build public URL for the object.');
      }

      // ADDED: Cache Busting logic
      // We append a timestamp to the URL so React Native knows it is a brand new image
      const timestampedUrl = `${publicUrl}?t=${new Date().getTime()}`;

      // Persist the NEW timestamped URL in DB
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ image: timestampedUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Update UI immediately with the new timestamped URL
      setProfile((prev) => (prev ? { ...prev, image: timestampedUrl } : prev));
      setImageUrl(timestampedUrl);
    } catch (e) {
      setUploadError(e?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const Avatar = () => {
    return (
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
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Ionicons name="person" size={26} color="#6DA047" />
        )}
      </View>
    );
  };

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
                <Avatar />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
                    {fullName || '—'}
                  </Text>
                  <Text style={{ color: '#888', marginTop: 4 }}>
                    {profile?.origin_type ? `Nationality: ${profile.origin_type}` : '—'}
                  </Text>

                  <TouchableOpacity
                    onPress={handlePickAndUpload}
                    disabled={uploading}
                    activeOpacity={0.85}
                    style={{
                      marginTop: 12,
                      backgroundColor: uploading ? '#b9d4a9' : '#6DA047',
                      borderRadius: 12,
                      paddingVertical: 8,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Upload profile photo"
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="image" size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#fff', fontWeight: '800' }}>UPLOAD</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {uploadError ? (
                    <Text style={{ color: '#b00020', marginTop: 8, fontWeight: '600' }}>
                      {uploadError}
                    </Text>
                  ) : null}
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
              <DetailRow label="Nationality" value={formatField(profile?.origin_type) || '—'} />
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