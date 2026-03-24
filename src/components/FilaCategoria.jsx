import React, { useState, memo } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FilaCategoria = memo(({ item, gastadoEnCat, actualizarAsignacion, confirmarEliminar, abrirModal }) => {
  const [valorLocal, setValorLocal] = useState(item.asignado > 0 ? item.asignado.toString() : "");

  // Si el valor cambia externamente (ej. al resetear presupuesto), actualizamos
  React.useEffect(() => {
    setValorLocal(item.asignado > 0 ? item.asignado.toString() : "");
  }, [item.asignado]);

  return (
    <View style={styles.fila}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => abrirModal(item)}>
        <Text style={styles.nombreCat}>{item.nombre}</Text>
        <Text style={styles.subtexto}>Ver gastos: {gastadoEnCat.toFixed(2)}€</Text>
      </TouchableOpacity>

      <View style={styles.derecha}>
        <Text style={styles.labelEuro}>€</Text>
        <TextInput
          keyboardType="numeric"
          style={styles.inputAsignado}
          placeholder="0"
          value={valorLocal}
          onChangeText={setValorLocal}
          onEndEditing={() => actualizarAsignacion(item.id, parseFloat(valorLocal) || 0)}
        />
        <TouchableOpacity onPress={() => confirmarEliminar(item.id, item.nombre)}>
          <Ionicons name="trash-outline" size={22} color="#ff5252" style={{ marginLeft: 15 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: "#fff", marginBottom: 8, borderRadius: 12, elevation: 2 },
  nombreCat: { fontSize: 16, fontWeight: "bold", color: "#333" },
  subtexto: { fontSize: 12, color: "#6200ee" },
  derecha: { flexDirection: "row", alignItems: "center" },
  labelEuro: { marginRight: 4, color: "#888", fontWeight: "bold" },
  inputAsignado: { borderBottomWidth: 1, borderBottomColor: "#6200ee", width: 70, textAlign: "right", fontSize: 16, padding: 5 },
});

export default FilaCategoria;