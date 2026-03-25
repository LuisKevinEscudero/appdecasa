import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

const HeaderAhorro = memo(
  ({
    totalIngresos,
    totalAsignado,
    totalAsignadoTarjeta,
    totalAsignadoEfectivo,
  }) => {
    const sobrante = totalIngresos - totalAsignado;
    const ahorro30 = sobrante > 0 ? sobrante * 0.3 : 0;
    const disponibleReal = sobrante - ahorro30;

    return (
      <View style={styles.cardAhorro}>
        <Text style={styles.montoAhorro}>
          Ahorro Sugerido: {ahorro30.toFixed(2)}€
        </Text>
        <Text style={styles.disponible}>
          Disponible para asignar: {disponibleReal.toFixed(2)}€
        </Text>

        {/* SECCIÓN NUEVA: DESGLOSE POR TIPO */}
        <View style={styles.contenedorTipos}>
          <View style={styles.cajaTipo}>
            <Text style={[styles.textoTipo, { color: "#2196f3" }]}>
              💳 Tarjeta: {totalAsignadoTarjeta.toFixed(2)}€
            </Text>
          </View>
          <View style={styles.cajaTipo}>
            <Text style={[styles.textoTipo, { color: "#2e7d32" }]}>
              💵 Efectivo: {totalAsignadoEfectivo.toFixed(2)}€
            </Text>
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cardAhorro: {
    backgroundColor: "#e8f5e9",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  montoAhorro: { fontSize: 18, fontWeight: "bold", color: "#2e7d32" },
  disponible: { fontSize: 14, color: "#666" },
  contenedorTipos: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#c8e6c9",
    paddingTop: 10,
  },
  cajaTipo: { flex: 1 },
  textoTipo: { fontSize: 13, fontWeight: "bold" },
});

export default HeaderAhorro;
