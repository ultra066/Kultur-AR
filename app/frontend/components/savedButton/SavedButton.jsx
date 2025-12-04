import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './SavedButton_styles';

const SavedButton = ({ isSaved, onToggleSave }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onToggleSave}>
      <Ionicons
        name={isSaved ? 'bookmark' : 'bookmark-outline'}
        size={30}
        color={isSaved ? 'green' : 'black'}
      />
    </TouchableOpacity>
  );
};

export default SavedButton;
