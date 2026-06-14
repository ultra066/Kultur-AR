import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, 
  StyleSheet, Keyboard, SafeAreaView, ScrollView, Animated, Clipboard 
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av'; // Added for Supabase playback
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 

// Database & JSON Imports
import bahraDict from '../../../bahra_translation.json';
import commonPhrasesData from '../../../common_phrases.json'; 
import { supabase } from '../../../lib/database/supabase'; 

export default function TranslationScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // New state for suggestions and audio
  const [suggestions, setSuggestions] = useState([]);
  const [sound, setSound] = useState();

  const glowAnim = useRef(new Animated.Value(1)).current;

  // Cleanup audio on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Animation for the speaker icon
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

  // Memoized Dictionary Lookup
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

  // Handle Input Change and Filter Suggestions
  const handleTextChange = (text) => {
    setInputText(text);

    const trimmed = text.trim();

    // If user cleared the input manually, also clear translated output
    if (!trimmed) {
      setTranslatedText('');
      setSuggestions([]);
      return;
    }

    // Clear old translation when user starts editing a new sentence
    setTranslatedText((prev) => (prev ? '' : prev));

    // Only show suggestions if user typed more than 2 characters
    if (trimmed.length > 2) {
      const normalizedQuery = text.toLowerCase();
      // Accessing the array inside your JSON structure
      const matches = commonPhrasesData.common_phrases.filter((phrase) =>
        phrase.tagalog.toLowerCase().includes(normalizedQuery) ||
        phrase.english.toLowerCase().includes(normalizedQuery)
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  // Select a suggestion from the list
  const handleSelectSuggestion = (phrase) => {
    setInputText(phrase.tagalog); // Autofill the text area with the Tagalog match
    setSuggestions([]); // Hide suggestions
  };

  const handleTranslateAndSpeak = async () => {
    if (!inputText.trim()) return;
    Keyboard.dismiss();
    setSuggestions([]); // Hide suggestions if Translate is tapped
    setIsLoading(true);

    const normalizedInput = inputText.trim().toLowerCase();

    // 1. Check Common Phrases FIRST (Prioritized)
    const phraseMatch = commonPhrasesData.common_phrases.find(p => 
      p.tagalog.toLowerCase() === normalizedInput || 
      p.english.toLowerCase() === normalizedInput
    );

    if (phraseMatch) {
      setTranslatedText(phraseMatch.bahra);
      setIsLoading(false);
      // Play the authentic recording from Supabase
      playRealAudio(phraseMatch.file_path);
      return; // Stop execution here
    }

    // 2. Check Local Dictionary Next
    let finalTranslation = '';
    if (dictionaryMap[normalizedInput]) {
      finalTranslation = dictionaryMap[normalizedInput];
    } else {
      // 3. Fallback to Gemini AI for Sentences
      try {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
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
    // Play synthetic speech for Dictionary/Gemini outputs
    playSyntheticSpeech(finalTranslation);
  };

  // Play audio from Supabase URL
  const playRealAudio = async (filePath) => {
    if (!filePath) return;
    await Speech.stop(); // Stop any synthetic speech
    setIsSpeaking(true);

    try {
      // The filePath already contains the full Supabase HTTPS link from the JSON.
      // We pass it directly to the Audio player instead of trying to generate a new public URL.
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: filePath },
        { shouldPlay: true }
      );
      
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsSpeaking(false);
          newSound.unloadAsync(); // Free memory
        }
      });
    } catch (error) {
      console.error("Supabase Audio Error:", error);
      setIsSpeaking(false);
    }
  };

  // Play synthetic AI Speech
  const playSyntheticSpeech = async (text) => {
    if (!text || text.includes("error")) return;
    if (sound) await sound.unloadAsync(); // Unload any Supabase audio
    
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

  // Global Audio Triggers based on source
  const handleSpeakerIconPress = () => {
    const normalizedInput = inputText.trim().toLowerCase();
    const phraseMatch = commonPhrasesData.common_phrases.find(p => 
      p.tagalog.toLowerCase() === normalizedInput || 
      p.english.toLowerCase() === normalizedInput
    );

    if (phraseMatch && translatedText === phraseMatch.bahra) {
      playRealAudio(phraseMatch.file_path);
    } else {
      playSyntheticSpeech(translatedText);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translation</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollView} keyboardShouldPersistTaps="handled">
        
        {/* Input Card */}
        <View style={[styles.card, { zIndex: 10 }]}>
          <Text style={styles.langLabel}>Tagalog / English</Text>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Anong balita?"
            multiline
            maxLength={120}
          />

          <View style={styles.inputFooter}>
            <Text style={styles.inputFooterText}>
              {inputText.trim().length > 0 ? `${inputText.trim().split(/\s+/).length} word(s) / 120 max` : `0 word(s) / 120 max`}
            </Text>
          </View>
          
          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.slice(0, 5).map((item) => ( 
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Text style={styles.suggestionText}>{item.tagalog}</Text>
                  <Text style={styles.suggestionSubText}>{item.english}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Output Card */}
        <View style={[styles.card, styles.outputCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.langLabel}>Bahra (Ternate)</Text>
            
            <TouchableOpacity onPress={handleSpeakerIconPress}>
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
            <TouchableOpacity 
              onPress={() => { setInputText(''); setTranslatedText(''); setSuggestions([]); }} 
              style={styles.footerIcon}
            >
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
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
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
  suggestionsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E9EB',
    maxHeight: 180,
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: { fontSize: 16, color: '#333', fontWeight: '500' },
  suggestionSubText: { fontSize: 12, color: '#888', marginTop: 2 },
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
  inputFooter: {
    marginTop: 8,
  },
  inputFooterText: {
    color: '#6A6A70',
    fontSize: 12,
    fontWeight: '600',
  },
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
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});