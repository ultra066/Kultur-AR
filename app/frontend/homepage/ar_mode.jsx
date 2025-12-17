import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, PermissionsAndroid, Platform } from 'react-native';
import UnityView, { UnityModule } from '@azesmway/react-native-unity';
import { useLocalSearchParams } from 'expo-router'; // To receive data from the previous screen

const ARMode = () => {
  const [hasPermission, setHasPermission] = useState(false);
  
  // Get parameters passed from the previous screen (e.g., from your Map or Gallery)
  // `mode` can be 'Artifacts', 'LocalCuisine', 'HistoricalSite', or 'Festival'
  // `modelAddress` is the specific Addressable path for a 3D model
  const { mode, modelAddress } = useLocalSearchParams(); 

  // --- Define the fixed addresses for your ONNX models (from your screenshot) ---
  const onnxForArtifacts = 'Assets/Model/Artifacts/artifacts_model.onnx';
  const onnxForCuisine = 'Assets/Model/Local Cuisine/local_canine.onnx'; // I'm using the exact name from your image, even with the typo

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

          // Always tell Unity to clear any previously loaded models first
          UnityModule.postMessage('UnityMessageManager', 'UnloadAllArtifacts', '');
          
          // Use a switch to handle the different modes
          switch (mode) {
            case 'Artifacts':
              console.log(`[React Native] Loading ONNX model: ${onnxForArtifacts}`);
              UnityModule.postMessage('UnityMessageManager', 'LoadONNXModel', onnxForArtifacts);
              break;

            case 'LocalCuisine':
              console.log(`[React Native] Loading ONNX model: ${onnxForCuisine}`);
              UnityModule.postMessage('UnityMessageManager', 'LoadONNXModel', onnxForCuisine);
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

  return (
    <View style={styles.container}>
      <UnityView
        style={styles.unity}
        onUnityMessage={(e) => console.log(`[React Native] Message from Unity: ${e.nativeEvent.message}`)}
      />
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
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ARMode;