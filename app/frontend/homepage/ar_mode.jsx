import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import UnityView, { UnityModule } from '@azesmway/react-native-unity';
import { useLocalSearchParams, useRouter } from 'expo-router'; // To receive data from the previous screen

const ARMode = () => {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [unityInstanceKey, setUnityInstanceKey] = useState(() => Date.now());

  // Modal gate
  const [showArLoadModal, setShowArLoadModal] = useState(false);
  const [isArConfirmed, setIsArConfirmed] = useState(false);

  // Get parameters passed from the previous screen (e.g., from your Map or Gallery)
  // `mode` can be 'Artifacts', 'LocalCuisine', 'HistoricalSite', or 'Festival'
  // `modelAddress` is the specific Addressable path for a 3D model
  const { mode, modelAddress } = useLocalSearchParams();

  // --- Step 1: Request Camera Permission ---
  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'AR Camera Permission',
              message: 'Kultur-AR needs camera access to display augmented reality.',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('[React Native] Camera permission granted.');
            setHasPermission(true);
          } else {
            console.log('[React Native] Camera permission denied.');
            // Handle permission denial (e.g., show an error or go back)
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        setHasPermission(true);
      }
    };

    checkAndRequestPermission();
  }, []);

  // Show the AR load modal once permission is granted
  useEffect(() => {
    if (hasPermission) {
      setShowArLoadModal(true);
      setIsArConfirmed(false);
    }
  }, [hasPermission]);

  // --- Step 2: Tell Unity Which Assets to Load (gated behind modal Ok) ---
  useEffect(() => {
    if (!hasPermission || !isArConfirmed) return;

    // Small delay to let the overlay disappear smoothly
    requestAnimationFrame(() => {
      if (UnityModule) {
        console.log(`[React Native] Entering AR mode: ${mode}`);

        // Use a switch to handle the different modes
        switch (mode) {
          case 'Artifacts':
            // Test-only: skip LoadONNXModel; Unity will use its own startup/default model.
            console.log('[React Native] (Test) Skipping LoadONNXModel for: Artifacts');
            break;

          case 'LocalCuisine':
            // Test-only: skip LoadONNXModel; Unity will use its own startup/default model.
            console.log('[React Native] (Test) Skipping LoadONNXModel for: LocalCuisine');
            break;

          case 'HistoricalSite':
            if (modelAddress) {
              console.log(`[React Native] Loading 3D Historical Site: ${modelAddress}`);
              UnityModule.postMessage('UnityMessageManager', 'LoadArtifact', modelAddress);
            } else {
              console.log('[React Native] No specific 3D model address was provided for HistoricalSite mode.');
            }
            break;

          case 'Festival':
            // This mode might not load a 3D model, but maybe a specific UI or image.
            // For now, we'll just start the camera.
            console.log('[React Native] Festival mode activated. No specific model loaded from RN.');
            break;

          default:
            console.log(`[React Native] Unknown AR mode: ${mode}.`);
            break;
        }
      }
    });
  }, [hasPermission, isArConfirmed, mode, modelAddress]); // This effect re-runs if the mode or model changes

  const handleConfirmOk = () => {
    setShowArLoadModal(false);
    setIsArConfirmed(true);
  };

  // --- Step 3: Render the UI ---
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Waiting for camera permission...</Text>
      </View>
    );
  }

  const handleBack = () => {
    // 1) Notify Unity to stop/unload BEFORE unmounting.
    try {
      if (UnityModule) {
        UnityModule.postMessage('UnityMessageManager', 'ShutdownUnity', '');
      }
    } catch (e) {
      console.warn('[React Native] Failed to notify Unity on back:', e);
    }

    // 2) Force UnityView to unmount/remount so AR loads from scratch next time.
    setUnityInstanceKey((prev) => prev + 1);

    // 3) Go back to the React screen.
    router.replace('/frontend/homepage/home');
  };

  return (
    <View style={styles.container}>
      {/* Only mount Unity after user taps Ok */}
      {isArConfirmed && (
        <UnityView
          key={unityInstanceKey}
          style={styles.unity}
          onUnityMessage={(e) => console.log(`[React Native] Message from Unity: ${e.nativeEvent.message}`)}
        />
      )}

      {/* Window overlay modal */}
      {!isArConfirmed && showArLoadModal && (
        <View style={styles.windowOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Preparing AR…</Text>
            <Text style={styles.modalBody}>AR will load to 15–20 seconds before it starts.</Text>
            <TouchableOpacity style={styles.okButton} onPress={handleConfirmOk} activeOpacity={0.9}>
              <Text style={styles.okButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Back button overlay */}
      <View style={styles.backButtonContainer} pointerEvents="box-none">
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.85}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  unity: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    zIndex: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 999,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  windowOverlay: {
    position: 'absolute',
    top: 110,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 999,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#111',
    borderRadius: 18,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalBody: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  okButton: {
    backgroundColor: '#6DA047',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ARMode;

