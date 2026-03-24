import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

const HeaderAhorro = memo(({ totalIngresos, totalAsignado }) => {
  const sobrante = totalIngresos - totalAsignado;
  const ahorro30 = sobrante > 0 ? sobrante * 0.3 : 0;
  const disponibleReal = sobrante - ahorro30;

  return (
    <View style={styles.cardAhorro}>
      <Text style={styles.montoAhorro}>Ahorro Sugerido: {ahorro30.toFixed(2)}€</Text>
      <Text style={styles.disponible}>Disponible para asignar: {disponibleReal.toFixed(2)}€</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  cardAhorro: { backgroundColor: "#e8f5e9", padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: "#c8e6c9" },
  montoAhorro: { fontSize: 18, fontWeight: "bold", color: "#2e7d32" },
  disponible: { fontSize: 14, color: "#666" },
});

export default HeaderAhorro;