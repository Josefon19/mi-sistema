import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function ProfileScreen() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function obtenerUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email || "");
    }
    obtenerUsuario();
  }, []);

  async function actualizarPassword() {
    setMensaje("");
    if (!newPassword.trim()) {
      setMensaje("Escribe una nueva contraseña.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMensaje("Error: " + error.message);
    } else {
      setMensaje("Contraseña actualizada correctamente.");
      setNewPassword("");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function desactivarCuenta() {
    const confirmacion = window.confirm("¿Estás seguro de que deseas desactivar tu cuenta? Esto borrará todos tus gastos de forma permanente.");
    
    if (confirmacion) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('gastos').delete().eq('user_id', user.id);
        await supabase.auth.signOut();
        router.replace("/login");
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Configuraciones</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.section}>
        <Ionicons name="person-circle-outline" size={80} color="#2ecc71" style={styles.profileIcon} />
        <Text style={styles.label}>Usuario Actual:</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Editar Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
        />
        <Pressable style={styles.updateButton} onPress={actualizarPassword}>
          <Text style={styles.updateButtonText}>Guardar Cambios</Text>
        </Pressable>
        {mensaje ? <Text style={styles.mensajeText}>{mensaje}</Text> : null}
      </View>

      <View style={styles.bottomActions}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Cerrar Sesión</Text>
        </Pressable>

        <Pressable style={styles.deactivateButton} onPress={desactivarCuenta}>
          <Ionicons name="warning-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Desactivar Cuenta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f6f8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 30 },
  backBtn: { padding: 5 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  section: { backgroundColor: "#ffffff", padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2, alignItems: "center" },
  profileIcon: { marginBottom: 10 },
  label: { fontSize: 14, color: "#888", marginBottom: 5 },
  email: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15, alignSelf: "flex-start" },
  input: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, padding: 12, backgroundColor: "#f9f9f9", fontSize: 16, width: "100%", marginBottom: 15 },
  updateButton: { backgroundColor: "#3498db", padding: 12, borderRadius: 8, width: "100%", alignItems: "center" },
  updateButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  mensajeText: { marginTop: 10, color: "#2ecc71", fontWeight: "bold", textAlign: "center" },
  bottomActions: { marginTop: "auto", gap: 15 },
  logoutButton: { flexDirection: "row", backgroundColor: "#34495e", padding: 15, borderRadius: 8, justifyContent: "center", alignItems: "center", gap: 10 },
  deactivateButton: { flexDirection: "row", backgroundColor: "#e74c3c", padding: 15, borderRadius: 8, justifyContent: "center", alignItems: "center", gap: 10 },
  actionText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});