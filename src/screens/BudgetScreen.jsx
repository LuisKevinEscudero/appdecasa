import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { BudgetContext } from "../context/BudgetContext";
import { Ionicons } from "@expo/vector-icons";

// 1. IMPORTAMOS LOS COMPONENTES EXTERNOS
import FilaCategoria from "../components/FilaCategoria";
import HeaderAhorro from "../components/HeaderAhorro";

export default function BudgetScreen() {
  const {
    totalIngresos,
    totalAsignado,
    categorias,
    gastos,
    actualizarAsignacion,
    agregarCategoria,
    eliminarCategoria,
    eliminarGasto,
    totalAsignadoTarjeta,
    totalAsignadoEfectivo,
    cambiarTipoPagoCategoria,
    desgloseUsuarios
  } = useContext(BudgetContext);

  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [catSeleccionada, setCatSeleccionada] = useState(null);

  const abrirModal = useCallback((cat) => {
    setCatSeleccionada(cat);
    setModalVisible(true);
  }, []);

  const handleCrearCategoria = () => {
    if (!nuevaCatNombre.trim()) return;
    agregarCategoria(nuevaCatNombre);
    setNuevaCatNombre("");
  };

  const confirmarEliminar = (id, nombre) => {
    Alert.alert("Eliminar", `¿Borrar ${nombre}?`, [
      { text: "No" },
      { text: "Sí", onPress: () => eliminarCategoria(id) },
    ]);
  };

  const gastosDeCategoria = catSeleccionada
    ? gastos.filter((g) => g.categoriaId === catSeleccionada.id)
    : [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        
        {/* HEADER DE AHORRO OPTIMIZADO */}
        <HeaderAhorro totalIngresos={totalIngresos} totalAsignado={totalAsignado} 
        totalAsignadoTarjeta={totalAsignadoTarjeta} totalAsignadoEfectivo={totalAsignadoEfectivo}
        desgloseUsuarios={desgloseUsuarios}/>

        <View style={styles.formAñadir}>
          <TextInput
            placeholder="Nueva categoría..."
            style={styles.inputNueva}
            value={nuevaCatNombre}
            onChangeText={setNuevaCatNombre}
          />
          <TouchableOpacity onPress={handleCrearCategoria}>
            <Ionicons name="add-circle" size={35} color="#6200ee" />
          </TouchableOpacity>
        </View>

        {/* --- CAMBIO AQUÍ: FLATLIST POR SCROLLVIEW --- */}
        <ScrollView 
          style={{ flex: 1 }} 
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {categorias.map((item) => {
            const gastadoEnEstaCat = gastos
              .filter((g) => g.categoriaId === item.id)
              .reduce((acc, curr) => acc + curr.monto, 0);

            return (
              <FilaCategoria
                key={item.id} // Clave única obligatoria
                item={item}
                gastadoEnCat={gastadoEnEstaCat}
                actualizarAsignacion={actualizarAsignacion}
                confirmarEliminar={confirmarEliminar}
                abrirModal={abrirModal}
                cambiarTipoPagoCategoria={cambiarTipoPagoCategoria}
              />
            );
          })}
        </ScrollView>

        {/* MODAL */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>{catSeleccionada?.nombre}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle" size={30} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {gastosDeCategoria.map((g) => (
                  <View key={g.id} style={styles.itemGasto}>
                    <Text>{g.nombre} - {g.monto.toFixed(2)}€</Text>
                    <TouchableOpacity onPress={() => eliminarGasto(g.id)}>
                      <Ionicons name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f8f9fa" },
  formAñadir: { flexDirection: "row", alignItems: "center", marginBottom: 15, backgroundColor: "#fff", borderRadius: 12, paddingLeft: 15 },
  inputNueva: { flex: 1, height: 50 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitulo: { fontSize: 22, fontWeight: "bold" },
  itemGasto: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#eee" }
});