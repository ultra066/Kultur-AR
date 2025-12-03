import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './SavedButton_styles';

const SavedButton = ({ onPress, initialState }) => {
  const [isSaved, setIsSaved] = useState(initialState);

  const handlePress = () => {
    setIsSaved(!isSaved);
    onPress();
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Ionicons
        name={isSaved ? 'bookmark' : 'bookmark-outline'}
        size={30}
        color={isSaved ? 'green' : 'black'}
      />
    </TouchableOpacity>
  );
};

export default SavedButton;
