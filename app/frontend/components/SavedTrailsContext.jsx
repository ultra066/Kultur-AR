import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../../../lib/database/supabase'; // Import supabase client

const SavedTrailsContext = createContext();

export const useSavedTrails = () => {
  return useContext(SavedTrailsContext);
};

export const SavedTrailsProvider = ({ children }) => {
  const [savedTrails, setSavedTrails] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Function to fetch saved trails from Supabase
  const fetchSavedTrails = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSavedTrails(new Set());
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('saved_trails')
      .select('trail_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching saved trails:', error);
    } else {
      const trailIds = data.map(dbItem => dbItem.trail_id);
      setSavedTrails(new Set(trailIds));
    }
    setLoading(false);
  };

  // Fetch trails on component mount and when user changes
  useEffect(() => {
    fetchSavedTrails();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchSavedTrails();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSave = async (trailId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated. Cannot save trail.');
      // Optionally, prompt user to log in
      return;
    }

    const isCurrentlySaved = savedTrails.has(trailId);

    if (isCurrentlySaved) {
      // Remove from Supabase
      const { error } = await supabase
        .from('trails')
        .delete()
        .eq('user_id', user.id)
        .eq('id', trailId);

      if (error) {
        console.error('Error unsaving trail:', error);
      } else {
        setSavedTrails((prevSavedTrails) => {
          const newSavedTrails = new Set(prevSavedTrails);
          newSavedTrails.delete(trailId);
          return newSavedTrails;
        });
      }
    } else {
      // Add to Supabase
      const { error } = await supabase.from('saved_trails').insert({
        user_id: user.id,
        trail_id: trailId,
      });

      if (error) {
        console.error('Error saving trail:', error);
      } else {
        setSavedTrails((prevSavedTrails) => {
          const newSavedTrails = new Set(prevSavedTrails);
          newSavedTrails.add(trailId);
          return newSavedTrails;
        });
      }
    }
  };

  const value = {
    savedTrails,
    handleSave,
    loading, // Expose loading state
  };

  return (
    <SavedTrailsContext.Provider value={value}>
      {children}
    </SavedTrailsContext.Provider>
  );
};
