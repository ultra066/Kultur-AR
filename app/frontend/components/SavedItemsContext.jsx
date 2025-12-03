import React, { createContext, useState, useContext } from 'react';

const SavedItemsContext = createContext();

export const useSavedItems = () => {
  return useContext(SavedItemsContext);
};

export const SavedItemsProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState([]);

  const handleSave = (item) => {
    setSavedItems((prevSavedItems) => {
      const isSaved = prevSavedItems.some(savedItem => savedItem.id === item.id && savedItem.type === item.type);
      if (isSaved) {
        return prevSavedItems.filter(savedItem => !(savedItem.id === item.id && savedItem.type === item.type));
      } else {
        return [...prevSavedItems, item];
      }
    });
  };

  const isSaved = (itemId, itemType) => {
    return savedItems.some(savedItem => savedItem.id === itemId && savedItem.type === itemType);
  }

  const value = {
    savedItems,
    handleSave,
    isSaved
  };

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
};
