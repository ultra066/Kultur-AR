import React, { createContext, useState, useContext } from 'react';

const SavedTrailsContext = createContext();

export const useSavedTrails = () => {
  return useContext(SavedTrailsContext);
};

export const SavedTrailsProvider = ({ children }) => {
  const [savedTrails, setSavedTrails] = useState(new Set());

  const handleSave = (trailId) => {
    setSavedTrails((prevSavedTrails) => {
      const newSavedTrails = new Set(prevSavedTrails);
      if (newSavedTrails.has(trailId)) {
        newSavedTrails.delete(trailId);
      } else {
        newSavedTrails.add(trailId);
      }
      return newSavedTrails;
    });
  };

  const value = {
    savedTrails,
    handleSave,
  };

  return (
    <SavedTrailsContext.Provider value={value}>
      {children}
    </SavedTrailsContext.Provider>
  );
};
