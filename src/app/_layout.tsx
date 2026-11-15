import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator, Text } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [inicializado, setInicializado] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Revisar si hay una sesión guardada al abrir la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInicializado(true); // Ya terminó de verificar
    });

    // Escuchar cambios (login o logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!inicializado) return;

    const enPantallaLogin = segments[0] === 'login';

    if (!session && !enPantallaLogin) {
      router.replace('/login');
    } else if (session && enPantallaLogin) {
      router.replace('/');
    }
  }, [session, inicializado, segments]);

  // BLOQUEO VISUAL: Si no ha terminado de verificar, mostramos la carga y bloqueamos las páginas
  if (!inicializado) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={{ marginTop: 15, color: '#888', fontSize: 16, fontWeight: 'bold' }}>
          Verificando sesión...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}