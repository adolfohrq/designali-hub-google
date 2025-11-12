import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import { debug } from '../utils/debug';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme === 'true');
    }
  }, []);

  // Load theme preference from user profile when user changes
  useEffect(() => {
    if (!user) return;

    const loadUserTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('dark_mode')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          debug.error('Error loading theme preference:', error);
          return;
        }

        if (data && data.dark_mode !== undefined && data.dark_mode !== null) {
          setIsDarkMode(data.dark_mode);
          localStorage.setItem('darkMode', data.dark_mode.toString());
        }
      } catch (error) {
        debug.error('Error loading theme preference:', error);
      }
    };

    loadUserTheme();
  }, [user]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());

    // Save to user profile if logged in
    if (user) {
      try {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            dark_mode: newMode,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (error) {
        debug.error('Error saving theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
