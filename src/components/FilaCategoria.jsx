import React, { useState, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FilaCategoria = memo(
  ({
    item,
    gastadoEnCat,
    actualizarAsignacion,
    confirmarEliminar,
    abrirModal,
    cambiarTipoPagoCategoria,
  }) => {
    const [valorLocal, setValorLocal] = useState(
      item.asignado > 0 ? item.asignado.toString() : "",
    );

    // Función para cambiar de Tarjeta a Efectivo y viceversa
    const alternarTipo = () => {
      const nuevoTipo = item.tipoPago === "efectivo" ? "tarjeta" : "efectivo";
      cambiarTipoPagoCategoria(item.id, nuevoTipo);
    };

    // Si el valor cambia externamente (ej. al resetear presupuesto), actualizamos
    React.useEffect(() => {
      setValorLocal(item.asignado > 0 ? item.asignado.toString() : "");
    }, [item.asignado]);

    return (
      <View
        style={[
          styles.fila,
          // Borde lateral dinámico: Verde para efectivo, Azul para tarjeta
          {
            borderLeftWidth: 6,
            borderLeftColor:
              item.tipoPago === "efectivo" ? "#4caf50" : "#2196f3",
          },
        ]}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={() => abrirModal(item)}>
          <Text style={styles.nombreCat}>{item.nombre}</Text>
          <Text style={styles.subtexto}>
            Ver gastos: {gastadoEnCat.toFixed(2)}€
          </Text>
        </TouchableOpacity>

        <View style={styles.derecha}>
          {/* BOTÓN PARA CAMBIAR TIPO DE PAGO */}
          <TouchableOpacity onPress={alternarTipo} style={styles.botonTipo}>
            <Ionicons
              name={
                item.tipoPago === "efectivo" ? "cash-outline" : "card-outline"
              }
              size={24}
              color={item.tipoPago === "efectivo" ? "#4caf50" : "#2196f3"}
            />
          </TouchableOpacity>

          <TextInput
            keyboardType="numeric"
            style={[
              styles.inputAsignado,
              // Color del texto del input según el tipo
              {
                borderBottomColor:
                  item.tipoPago === "efectivo" ? "#4caf50" : "#2196f3",
              },
            ]}
            placeholder="0"
            value={valorLocal}
            onChangeText={setValorLocal}
            onEndEditing={() =>
              actualizarAsignacion(item.id, parseFloat(valorLocal) || 0)
            }
          />

          <TouchableOpacity
            onPress={() => confirmarEliminar(item.id, item.nombre)}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color="#ff5252"
              style={{ marginLeft: 15 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  nombreCat: { fontSize: 16, fontWeight: "bold", color: "#333" },
  subtexto: { fontSize: 12, color: "#6200ee" },
  derecha: { flexDirection: "row", alignItems: "center" },
  labelEuro: { marginRight: 4, color: "#888", fontWeight: "bold" },
  inputAsignado: {
    borderBottomWidth: 1,
    borderBottomColor: "#6200ee",
    width: 70,
    textAlign: "right",
    fontSize: 16,
    padding: 5,
  },
  botonTipo: {
    marginRight: 10,
    padding: 5,
  },
  fila: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 15, 
    backgroundColor: "#fff", 
    marginBottom: 8, 
    borderRadius: 12, 
    elevation: 2 
  },
});

export default FilaCategoria;
