import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Función genérica para validar antes de consultar a Supabase
  function validarEntradas() {
    const emailLimpio = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para correos

    if (!emailLimpio || !password) {
      setErrorMessage("Por favor, llena todos los campos.");
      return false;
    }
    if (!emailRegex.test(emailLimpio)) {
      setErrorMessage("Ingresa un correo electrónico válido.");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    return true;
  }

  async function handleLogin() {
    setErrorMessage("");
    if (!validarEntradas()) return; // Detenemos la ejecución si falla la validación

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(), // Sanitizamos quitando espacios
      password: password,
    });

    if (error) {
      setErrorMessage("Error: Correo o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.replace("/");
    }
  }

  async function handleSignUp() {
    setErrorMessage("");
    if (!validarEntradas()) return;

    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else if (data.session) {
      router.replace("/");
    } else {
      setErrorMessage("Registro exitoso. Revisa tu correo.");
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
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#ffffff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 40, textAlign: "center", color: "#2ecc71" },
  input: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, padding: 15, marginBottom: 20, fontSize: 16, backgroundColor: "#f9f9f9" },
  errorText: { color: "#e74c3c", textAlign: "center", marginBottom: 15, fontWeight: "bold" },
  button: { backgroundColor: "#2ecc71", padding: 15, borderRadius: 8, alignItems: "center", marginBottom: 15 },
  buttonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  signupButton: { backgroundColor: "transparent", borderWidth: 2, borderColor: "#2ecc71" },
  signupText: { color: "#2ecc71" },
});