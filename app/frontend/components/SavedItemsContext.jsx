import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../../../lib/database/supabase'; // Import supabase client

const SavedItemsContext = createContext();

export const useSavedItems = () => {
  return useContext(SavedItemsContext);
};

export const SavedItemsProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch saved items from Supabase
  const fetchSavedItems = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSavedItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('saved_items')
      .select('item_id, item_type, item_name, item_description, item_image_url')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching saved items:', error);
    } else {
      const formattedItems = data.map(dbItem => ({
        id: dbItem.item_id,
        type: dbItem.item_type,
        name: dbItem.item_name,
        description: dbItem.item_description,
        image_url: dbItem.item_image_url,
      }));
      setSavedItems(formattedItems);
    }
    setLoading(false);
  };

  // Fetch items on component mount and when user changes
  useEffect(() => {
    fetchSavedItems();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchSavedItems();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSave = async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated. Cannot save item.');
      // Optionally, prompt user to log in
      return;
    }

    const isCurrentlySaved = savedItems.some(
      (savedItem) => savedItem.id === item.id && savedItem.type === item.type
    );

    if (isCurrentlySaved) {
      // Remove from Supabase
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .eq('item_type', item.type);

      if (error) {
        console.error('Error unsaving item:', error);
      } else {
        setSavedItems((prevSavedItems) =>
          prevSavedItems.filter(
            (savedItem) => !(savedItem.id === item.id && savedItem.type === item.type)
          )
        );
      }
    } else {
      // Add to Supabase
      const { error } = await supabase.from('saved_items').insert({
        user_id: user.id,
        item_id: item.id,
        item_type: item.type,
        item_name: item.name,
        item_description: item.description,
        item_image_url: item.image_url,
      });

      if (error) {
        console.error('Error saving item:', error);
      } else {
        setSavedItems((prevSavedItems) => [...prevSavedItems, item]);
      }
    }
  };

  const isSaved = (itemId, itemType) => {
    return savedItems.some(
      (savedItem) => savedItem.id === itemId && savedItem.type === itemType
    );
  };

  const value = {
    savedItems,
    handleSave,
    isSaved,
    loading, // Expose loading state
  };

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
};
