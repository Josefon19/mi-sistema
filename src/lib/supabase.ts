import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Reemplaza esto con los datos de tu proyecto (Project Settings > API)
const supabaseUrl = 'https://bzvsbszqfygufwwszqfv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dnNic3pxZnlndWZ3d3N6cWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNDEzODMsImV4cCI6MjEwODcxNzM4M30.n5uK1IhLssY5qm2KNwhnV6m3PGq9XlRvfVCP_Nb34I0';

// Adaptador seguro para evitar que Node.js colapse al no encontrar 'window'
const webSafeStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: webSafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});