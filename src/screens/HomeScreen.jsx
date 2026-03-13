import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { BudgetContext } from '../context/BudgetContext';

export default function HomeScreen() {
  const { totalIngresos, totalGastado, categorias, gastos, registrarMovimientoGasto } = useContext(BudgetContext);
  
  const [nombreGasto, setNombreGasto] = useState('');
  const [montoGasto, setMontoGasto] = useState('');
  const [catSeleccionada, setCatSeleccionada] = useState(categorias[0]?.id);

  const saldoRestante = totalIngresos - totalGastado;

  const registrarGasto = () => {
    if (!montoGasto || !nombreGasto) return Alert.alert("Error", "Rellena los campos");
    registrarMovimientoGasto({
      nombre: nombreGasto,
      monto: parseFloat(montoGasto),
      categoriaId: catSeleccionada
    });
    setMontoGasto(''); setNombreGasto('');
    Alert.alert("¡Hecho!", "Gasto registrado correctamente");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        
        {/* 1. TARJETA DE SALDO (HEADER) */}
        <View style={styles.cardResumen}>
          <Text style={styles.saludo}>Dinero Restante</Text>
          <Text style={styles.saldoNumero}>{saldoRestante.toFixed(2)}€</Text>
          <Text style={styles.subtituloSaldo}>Total mes: {totalIngresos.toFixed(2)}€</Text>
        </View>

        {/* 2. GASTO RÁPIDO (AHORA PRIMERO) */}
        <View style={styles.cardGasto}>
          <Text style={styles.seccionTitulo}>Añadir Gasto Rápido</Text>
          <TextInput 
            placeholder="¿En qué has gastado?" 
            style={styles.input} 
            value={nombreGasto} 
            onChangeText={setNombreGasto} 
          />
          <TextInput 
            placeholder="Monto €" 
            keyboardType="numeric" 
            style={styles.input} 
            value={montoGasto} 
            onChangeText={setMontoGasto} 
          />
          
          <Text style={styles.labelMini}>Selecciona Categoría:</Text>
          <View style={styles.selector}>
            {categorias.map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.chip, catSeleccionada === cat.id && styles.chipActivo]}
                onPress={() => setCatSeleccionada(cat.id)}
              >
                <Text style={[styles.chipText, catSeleccionada === cat.id && styles.textBlanco]}>
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.boton} onPress={registrarGasto}>
            <Text style={styles.botonTexto}>Restar del presupuesto</Text>
          </TouchableOpacity>
        </View>

        {/* 3. USO DEL PRESUPUESTO (DEBAJO) */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Estado de tus Categorías</Text>
          {categorias.map(cat => {
            const gastadoCat = gastos.filter(g => g.categoriaId === cat.id)
                                      .reduce((acc, curr) => acc + curr.monto, 0);
            const porcentaje = cat.asignado > 0 ? (gastadoCat / cat.asignado) : 0;
            
            return (
              <View key={cat.id} style={styles.contenedorBarra}>
                <View style={styles.infoBarra}>
                  <Text style={styles.nombreCat}>{cat.nombre}</Text>
                  <Text style={styles.cifrasBarra}>{gastadoCat.toFixed(2)}€ / {cat.asignado}€</Text>
                </View>
                <View style={styles.barraFondo}>
                  <View style={[
                    styles.barraColor, 
                    { 
                      width: `${Math.min(porcentaje * 100, 100)}%`, 
                      backgroundColor: porcentaje > 0.9 ? '#ff5252' : '#6200ee' 
                    }
                  ]} />
                </View>
              </View>
            );
          })}
        </View>
        
        <View style={{ height: 50 }} /> 
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  cardResumen: { backgroundColor: '#6200ee', padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 15, elevation: 5 },
  saludo: { color: '#e1d0ff', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  saldoNumero: { color: '#fff', fontSize: 38, fontWeight: 'bold', marginVertical: 5 },
  subtituloSaldo: { color: '#e1d0ff', fontSize: 13 },
  cardGasto: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  seccion: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20 },
  seccionTitulo: { fontSize: 17, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  labelMini: { fontSize: 12, color: '#888', marginBottom: 10 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 15, padding: 8, fontSize: 16 },
  selector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#f0f0f0', borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  chipActivo: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  chipText: { color: '#555', fontSize: 13 },
  textBlanco: { color: '#fff', fontWeight: 'bold' },
  boton: { backgroundColor: '#03dac6', padding: 16, borderRadius: 15, alignItems: 'center' },
  botonTexto: { fontWeight: 'bold', color: '#000', fontSize: 16 },
  contenedorBarra: { marginBottom: 18 },
  infoBarra: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  nombreCat: { fontSize: 14, color: '#444', fontWeight: '500' },
  cifrasBarra: { fontSize: 13, color: '#777' },
  barraFondo: { height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  barraColor: { height: '100%', borderRadius: 5 },
});