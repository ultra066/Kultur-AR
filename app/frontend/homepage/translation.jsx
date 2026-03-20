import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, 
  StyleSheet, Keyboard, SafeAreaView, ScrollView, Animated, Clipboard 
} from 'react-native';
import * as Speech from 'expo-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Switch to Expo's built-in icons
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 

import bahraDict from '../../../bahra_translation.json';

export default function TranslationScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      glowAnim.setValue(1);
    }
  }, [isSpeaking]);

  const dictionaryMap = useMemo(() => {
    const dict = {};
    bahraDict.forEach((section) => {
      section.entries.forEach((entry) => {
        if (entry.tagalog) dict[entry.tagalog.toLowerCase().trim()] = entry.bahra;
        if (entry.english) dict[entry.english.toLowerCase().trim()] = entry.bahra;
      });
    });
    return dict;
  }, []);

  const handleTranslateAndSpeak = async () => {
    if (!inputText.trim()) return;
    Keyboard.dismiss();
    setIsLoading(true);

    const normalizedInput = inputText.trim().toLowerCase();
    let finalTranslation = '';

    if (dictionaryMap[normalizedInput]) {
      finalTranslation = dictionaryMap[normalizedInput];
    } else {
      try {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBi4Mm4RUSThEcsjPErdmTMVt-BQ5RnUSQ'; 
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const prompt = `You are a linguistics expert for Bahra (Ternate Chavacano).

        Translate the following text to Bahra: "${inputText}".

        Rules:

        - Return ONLY the translated string.
        - No explanations or markdown.
        - Use Ternate-specific terminology.`;
        const result = await model.generateContent(prompt);
        finalTranslation = result.response.text().trim();
      } catch (error) {
        finalTranslation = "May error sa pagsasalin.";
      }
    }

    setTranslatedText(finalTranslation);
    setIsLoading(false);
    playSpeech(finalTranslation);
  };

  const playSpeech = async (text) => {
    if (!text || text.includes("error")) return;
    await Speech.stop();
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'es-MX',
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translation</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollView}>
        
        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.langLabel}>Tagalog / English</Text>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Anong balita?"
            multiline
          />
        </View>

        {/* Output Card */}
        <View style={[styles.card, styles.outputCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.langLabel}>Bahra (Ternate)</Text>
            
            <TouchableOpacity onPress={() => playSpeech(translatedText)}>
              <Animated.View style={{ transform: [{ scale: glowAnim }] }}>
                <MaterialCommunityIcons 
                  name="volume-high" 
                  size={26} 
                  color={isSpeaking ? "#6DA047" : "#999"} 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Text style={[styles.translatedText, !translatedText && styles.placeholderText]}>
            {translatedText || "Mag-antay..."}
          </Text>
          
          <View style={styles.cardFooter}>
            <TouchableOpacity onPress={() => { setInputText(''); setTranslatedText(''); }} style={styles.footerIcon}>
               <Ionicons name="trash-outline" size={20} color="#999" />
               <Text style={styles.footerText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Clipboard.setString(translatedText)}>
               <Ionicons name="copy-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.mainBtn} onPress={handleTranslateAndSpeak}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Translate</Text>}
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color="#6A6A70" />
            <Text style={styles.menuText}>Show dictionary</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="star-outline" size={24} color="#6A6A70" />
            <Text style={styles.menuText}>Rate translation</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F0E9' },
  scrollView: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#F2F0E9',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSpacer: { width: 50 },
  container: { padding: 20, paddingTop: 10 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 15, 
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  outputCard: { 
    backgroundColor: '#F8F9FA', 
    borderWidth: 1, 
    borderColor: '#E0E3E8' 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  langLabel: { fontSize: 12, color: '#6A6A70', fontWeight: 'bold' },
  textInput: { fontSize: 18, color: '#333', minHeight: 60, textAlignVertical: 'top' },
  translatedText: { fontSize: 20, color: '#6DA047', fontWeight: '600', minHeight: 60 },
  placeholderText: { color: '#A8A8B0' },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: '#E8E9EB', 
    paddingTop: 10 
  },
  footerIcon: { flexDirection: 'row', alignItems: 'center' },
  footerText: { marginLeft: 5, color: '#6A6A70', fontSize: 14 },
  mainBtn: { 
    backgroundColor: '#6DA047', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginVertical: 10,
    shadowColor: '#6DA047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  menuRow: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  menuItem: { flex: 1, padding: 20, alignItems: 'center' },
  menuText: { fontSize: 12, marginTop: 8, color: '#6A6A70' },
  divider: { width: 1, backgroundColor: '#E8E9EB' }
});
