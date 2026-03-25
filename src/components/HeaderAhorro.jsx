import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

const HeaderAhorro = memo(
  ({
    totalIngresos,
    totalAsignado,
    totalAsignadoTarjeta,
    totalAsignadoEfectivo,
    desgloseUsuarios,
  }) => {
    return (
      <View style={styles.cardAhorro}>
        <Text style={[styles.tituloSeccion, { marginBottom: 10 }]}>Resumen de Ahorro</Text>
        
        {/* DESGLOSE POR USUARIO */}
        {desgloseUsuarios.map((u) => (
          <View key={u.id} style={styles.filaUsuario}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <View style={[styles.puntoColor, { backgroundColor: u.color }]} />
               <Text style={styles.nombreUsuario}>{u.nombre}:</Text>
            </View>
            <Text style={styles.montoAhorroIndividual}>
              {u.ahorroIndividual.toFixed(2)}€
            </Text>
          </View>
        ))}

        <View style={styles.separador} />

        <Text style={styles.disponible}>
          Presupuesto Total: {totalAsignado.toFixed(2)}€ / {totalIngresos.toFixed(2)}€
        </Text>

        {/* SECCIÓN: DESGLOSE POR TIPO DE PAGO */}
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
  );}
);

const styles = StyleSheet.create({
  cardAhorro: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: "#eee" },
  tituloSeccion: { fontSize: 14, fontWeight: "bold", color: "#666", textTransform: "uppercase" },
  filaUsuario: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  puntoColor: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  nombreUsuario: { fontSize: 16, color: "#333" },
  montoAhorroIndividual: { fontSize: 16, fontWeight: "bold", color: "#2e7d32" },
  disponible: { fontSize: 13, color: "#888", marginBottom: 10, textAlign: "center" },
  separador: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  contenedorTipos: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
  cajaTipo: { flex: 1 },
  textoTipo: { fontSize: 13, fontWeight: "bold" },
});

export default HeaderAhorro;
