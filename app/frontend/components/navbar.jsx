import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Navbar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Animation logic (optional press effect)
          const scaleValue = new Animated.Value(1);
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // --- ICON MAPPING ---
          let iconName;
          let IconLib = Ionicons;
          let label = options.title;

          // 1. Home
          if (route.name === 'home') {
            iconName = isFocused ? 'home' : 'home-outline';
          } 
          // 2. Translation
          else if (route.name === 'translation') {
            iconName = isFocused ? 'language' : 'language-outline';
          } 
          // 3. AR Mode (The Middle Button)
          else if (route.name === 'ar_mode') {
            iconName = 'augmented-reality'; // Or 'view-in-ar'
            IconLib = MaterialCommunityIcons;
          } 
          // 4. Map
          else if (route.name === 'map') {
            iconName = isFocused ? 'map' : 'map-outline';
          } 
          // 5. Saved
          else if (route.name === 'saved') {
            iconName = isFocused ? 'bookmark' : 'bookmark-outline'; // Matches your mockup
          }

          // Special Logic for Middle Button
          const isMiddleButton = route.name === 'ar_mode';
          
          // Color logic: Green for active, Gray for inactive, White for Middle Button
          const iconColor = isMiddleButton ? '#fff' : (isFocused ? '#6DA047' : '#888');
          const textColor = isFocused ? '#6DA047' : '#888';

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabItem, 
                isMiddleButton && styles.middleButtonContainer // Special positioning for middle
              ]}
            >
              {/* Icon Container */}
              <View style={[
                styles.iconWrapper, 
                isMiddleButton && styles.middleButtonCircle // Green Circle style
              ]}>
                <IconLib name={iconName} size={isMiddleButton ? 32 : 24} color={iconColor} />
              </View>

              {/* Label (Hidden for Middle Button) */}
              {!isMiddleButton && (
                <Text style={[styles.label, { color: textColor }]}>
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: width,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    width: width - 30, // Slight margin from edges
    height: 70,
    backgroundColor: '#fff', // White background
    borderRadius: 35, // Fully rounded edges like a pill
    alignItems: 'center',
    justifyContent: 'space-between', // Spread items evenly
    paddingHorizontal: 10,
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60, // Fixed width for touch targets
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  
  // === MIDDLE BUTTON STYLES ===
  middleButtonContainer: {
    top: -25, // Move it upwards out of the bar
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleButtonCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#355E3B', // Darker Green (Hunter Green) matching your mockup
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow specific to the button
    shadowColor: '#355E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#f2f0e9', // Matches app background to look "cut out"
  },
});