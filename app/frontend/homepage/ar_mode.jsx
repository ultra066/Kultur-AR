import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import UnityView, { UnityModule } from '@azesmway/react-native-unity';
import { useLocalSearchParams, useRouter } from 'expo-router'; // To receive data from the previous screen

const ARMode = () => {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [unityInstanceKey, setUnityInstanceKey] = useState(() => Date.now());

  
  
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
              title: "AR Camera Permission",
              message: "Kultur-AR needs camera access to display augmented reality.",
              buttonPositive: "OK",
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("[React Native] Camera permission granted.");
            setHasPermission(true);
          } else {
            console.log("[React Native] Camera permission denied.");
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

  // --- Step 2: Tell Unity Which Assets to Load ---
  useEffect(() => {
    // This runs as soon as permission is granted
    if (hasPermission) {
      requestAnimationFrame(() => {
        if (UnityModule) {
          console.log(`[React Native] Entering AR mode: ${mode}`);


          
          // Use a switch to handle the different modes
          switch (mode) {
            case 'Artifacts':
              // Test-only: skip LoadONNXModel; Unity will use its own startup/default model.
              console.log(`[React Native] (Test) Skipping LoadONNXModel for: ${onnxForArtifacts}`);
              break;


            case 'LocalCuisine':
              // Test-only: skip LoadONNXModel; Unity will use its own startup/default model.
              console.log(`[React Native] (Test) Skipping LoadONNXModel for: ${onnxForCuisine}`);
              break;


            case 'HistoricalSite':
              if (modelAddress) {
                console.log(`[React Native] Loading 3D Historical Site: ${modelAddress}`);
                UnityModule.postMessage('UnityMessageManager', 'LoadArtifact', modelAddress);
              } else {
                console.log("[React Native] No specific 3D model address was provided for HistoricalSite mode.");
              }
              break;

            case 'Festival':
              // This mode might not load a 3D model, but maybe a specific UI or image.
              // For example, you could load the 'Wagayway Festival.png' as a texture.
              // For now, we'll just start the camera.
              console.log("[React Native] Festival mode activated. No specific model loaded from RN.");
              break;

            default:
              console.log(`[React Native] Unknown AR mode: ${mode}.`);
              break;
          }
        }
      });
    }
  }, [hasPermission, mode, modelAddress]); // This effect re-runs if the mode or model changes

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
    // If your Unity side has a real stop method, add it and call it here.
    // Tell UnityMessageManager to shutdown the AR experience properly.
    // (Unity side must implement this method.)
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
      <UnityView
        key={unityInstanceKey}
        style={styles.unity}
        onUnityMessage={(e) => console.log(`[React Native] Message from Unity: ${e.nativeEvent.message}`)}
      />

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
});

export default ARMode;
