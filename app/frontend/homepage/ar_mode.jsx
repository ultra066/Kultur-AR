import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, PermissionsAndroid, Platform } from 'react-native';
import UnityView, { UnityModule } from '@azesmway/react-native-unity';

const ARMode = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "AR Camera Permission",
              message: "We need access to your camera to show AR artifacts.",
              buttonPositive: "OK",
              buttonNegative: "Cancel",
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Camera permission granted");
            setHasPermission(true);
          } else {
            console.log("Camera permission denied");
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        // iOS permissions are handled by Info.plist
        setHasPermission(true);
      }
    };

    checkAndRequestPermission();
  }, []);

  useEffect(() => {
    // IMMEDIATE STARTUP LOGIC
    if (hasPermission) {
      // Use requestAnimationFrame to send the message as soon as the next frame is ready.
      // This is much faster and safer than a fixed timer.
      requestAnimationFrame(() => {
        if (UnityModule) {
          console.log("Sending Start Message IMMEDIATELY");
          // Send the message multiple times in quick succession to ensure Unity catches it
          // during its initialization phase. This is a common trick for faster startup.
          UnityModule.postMessage('UnityMessageManager', 'LoadMode', 'Artifacts');
          
          // Optional: Send it again after 500ms just in case the first one was too fast
          setTimeout(() => {
             UnityModule.postMessage('UnityMessageManager', 'LoadMode', 'Artifacts');
          }, 500);
        }
      });
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Waiting for Camera Permission...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 
        UnityView is rendered immediately after permission is granted.
        No artificial delays.
      */}
      <UnityView
        style={styles.unity}
        onUnityMessage={(e) => console.log("Message from Unity:", e.nativeEvent.message)}
      />
      
      {/* Minimal overlay to verify RN is rendering */}
      <View style={styles.overlay}>
        <Text style={styles.text}>AR Mode Active</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Transparent background is critical for seeing Unity if Z-ordering fails
    backgroundColor: 'transparent', 
  },
  unity: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
    zIndex: 2,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

export default ARMode;