import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

interface Gasto {
  id: string;
  descripcion: string;
  cantidad: number;
}

export default function HomeScreen() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Sanitiza el campo de texto para que solo acepte números y un punto decimal
  function manejarCambioCantidad(texto: string) {
    // Reemplaza cualquier cosa que no sea número o punto
    let textoSanitizado = texto.replace(/[^0-9.]/g, '');
    
    // Evita que pongan más de un punto (ej. 10.5.2)
    const partes = textoSanitizado.split('.');
    if (partes.length > 2) {
      textoSanitizado = partes[0] + '.' + partes.slice(1).join('');
    }
    
    setCantidad(textoSanitizado);
  }

  useEffect(() => {
    cargarGastos();
  }, []);

  async function cargarGastos() {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Error al cargar gastos:", error.message);
    else if (data) setGastos(data);
  }

  const totalGastado = gastos.reduce((total, item) => total + Number(item.cantidad), 0);

  async function guardarGasto() {
    const descripcionLimpia = descripcion.trim();
    const monto = parseFloat(cantidad);

    // Validaciones estrictas
    if (descripcionLimpia.length === 0) {
      window.alert("La descripción del gasto no puede estar vacía.");
      return;
    }
    if (isNaN(monto) || monto <= 0) {
      window.alert("Por favor ingresa una cantidad válida mayor a 0.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editandoId) {
      const { error } = await supabase
        .from('gastos')
        .update({ descripcion: descripcionLimpia, cantidad: monto }) // Usamos las variables limpias
        .eq('id', editandoId)
        .eq('user_id', user.id); 

      if (error) console.error("Error al actualizar:", error.message);
      else {
        setGastos(gastos.map(g => g.id === editandoId ? { ...g, descripcion: descripcionLimpia, cantidad: monto } : g));
        limpiarFormulario();
      }
    } else {
      const { data, error } = await supabase
        .from('gastos')
        .insert([{ user_id: user.id, descripcion: descripcionLimpia, cantidad: monto }]) // Usamos las variables limpias
        .select();

      if (error) console.error("Error al guardar:", error.message);
      else if (data) {
        setGastos([data[0], ...gastos]);
        limpiarFormulario();
      }
    }
  }

  function prepararEdicion(gasto: Gasto) {
    setEditandoId(gasto.id);
    setDescripcion(gasto.descripcion);
    setCantidad(gasto.cantidad.toString());
  }

  async function eliminarGasto(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('gastos').delete().eq('id', id).eq('user_id', user.id);

    if (error) console.error("Error al eliminar:", error.message);
    else {
      setGastos(gastos.filter(g => g.id !== id));
      if (editandoId === id) limpiarFormulario();
    }
  }

  function limpiarFormulario() {
    setDescripcion("");
    setCantidad("");
    setEditandoId(null);
  }

  return (
    <View style={styles.container}>
      {/* NUEVO ENCABEZADO CON ÍCONO DE PERFIL */}
      <View style={styles.header}>
        <Text style={styles.title}>Resumen</Text>
        <Pressable onPress={() => router.push("/profile")}>
          <Ionicons name="person-circle" size={40} color="#2ecc71" />
        </Pressable>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Gastado</Text>
        <Text style={styles.balance}>$ {totalGastado.toFixed(2)}</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="¿En qué gastaste?"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 10 }]}
          placeholder="$ 0.00"
          value={cantidad}
          onChangeText={manejarCambioCantidad} // <-- Usamos la nueva función aquí
          keyboardType="numeric"
        />
        <Pressable style={[styles.addButton, editandoId && styles.editButton]} onPress={guardarGasto}>
          <Text style={styles.addButtonText}>{editandoId ? "✓" : "+"}</Text>
        </Pressable>
        {editandoId && (
          <Pressable style={styles.cancelButton} onPress={limpiarFormulario}>
            <Text style={styles.addButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gastoItem}>
            <View style={styles.gastoInfo}>
              <Text style={styles.gastoDescripcion}>{item.descripcion}</Text>
              <Text style={styles.gastoCantidad}>${Number(item.cantidad).toFixed(2)}</Text>
            </View>
            <View style={styles.accionesContainer}>
              <Pressable style={styles.accionBtn} onPress={() => prepararEdicion(item)}>
                <Ionicons name="pencil" size={20} color="#3498db" />
              </Pressable>
              <Pressable style={styles.accionBtn} onPress={() => eliminarGasto(item.id)}>
                <Ionicons name="trash" size={20} color="#e74c3c" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay gastos registrados aún.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f6f8" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  card: { backgroundColor: "#2ecc71", padding: 25, borderRadius: 15, alignItems: "center", marginBottom: 20, elevation: 5 },
  cardTitle: { color: "#ffffff", fontSize: 16, opacity: 0.9, marginBottom: 10 },
  balance: { color: "#ffffff", fontSize: 36, fontWeight: "bold" },
  formContainer: { flexDirection: "row", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, padding: 12, backgroundColor: "#ffffff", fontSize: 16 },
  addButton: { backgroundColor: "#2ecc71", justifyContent: "center", alignItems: "center", borderRadius: 8, width: 50, marginLeft: 10 },
  editButton: { backgroundColor: "#3498db" },
  cancelButton: { backgroundColor: "#95a5a6", justifyContent: "center", alignItems: "center", borderRadius: 8, width: 50, marginLeft: 10 },
  addButtonText: { color: "#ffffff", fontSize: 20, fontWeight: "bold" },
  gastoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", padding: 15, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: "#e74c3c" },
  gastoInfo: { flex: 1 },
  gastoDescripcion: { fontSize: 16, color: "#333" },
  gastoCantidad: { fontSize: 16, fontWeight: "bold", color: "#e74c3c" },
  accionesContainer: { flexDirection: "row", gap: 15 },
  accionBtn: { padding: 5 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 20 },
});