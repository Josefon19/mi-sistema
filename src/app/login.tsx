import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { supabase } from "../lib/supabase"; // Importamos tu conexión real

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para iniciar sesión con una cuenta existente
  async function handleLogin() {
    setErrorMessage("");
    if (!email.trim() || !password) {
      setErrorMessage("Por favor, escribe tu correo y contraseña.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMessage("Error: Correo o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.replace("/");
    }
  }

  // Función para registrar un nuevo usuario en la base de datos
  async function handleSignUp() {
    setErrorMessage("");
    if (!email.trim() || !password) {
      setErrorMessage("Por favor, escribe un correo y contraseña para registrarte.");
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else if (data.session) {
      router.replace("/");
    } else {
      // Supabase por defecto pide confirmar el correo, puedes desactivar esto en su panel (Authentication > Providers > Email)
      setErrorMessage("Registro exitoso. (Si activaste confirmación, revisa tu correo).");
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastos Básicos</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      
      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={{ marginBottom: 20 }} />
      ) : (
        <View>
          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.signupButton]} onPress={handleSignUp}>
            <Text style={[styles.buttonText, styles.signupText]}>Crear Cuenta</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#2ecc71",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#2ecc71",
  },
  signupText: {
    color: "#2ecc71",
  },
});