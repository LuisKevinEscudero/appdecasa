import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { BudgetContext } from '../context/BudgetContext';

export default function IncomeScreen() {
  const { ingresos, totalIngresos, agregarIngreso } = useContext(BudgetContext);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');

  const manejarAñadir = () => {
    if (!concepto || !monto) return;
    agregarIngreso({ id: Date.now().toString(), concepto, cantidad: monto });
    setConcepto(''); setMonto('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Total: {totalIngresos.toFixed(2)}€</Text>
      <FlatList
        data={ingresos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.fila}><Text>{item.concepto}</Text><Text>+{item.cantidad}€</Text></View>
        )}
      />
      <View style={styles.form}>
        <TextInput placeholder="Sueldo, Bono..." style={styles.input} value={concepto} onChangeText={setConcepto} />
        <TextInput placeholder="Cantidad" keyboardType="numeric" style={styles.input} value={monto} onChangeText={setMonto} />
        <TouchableOpacity style={styles.boton} onPress={manejarAñadir}><Text style={{color:'#fff'}}>Añadir</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#fff', marginBottom: 5 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 5 },
  boton: { backgroundColor: '#6200ee', padding: 15, alignItems: 'center', borderRadius: 10 },
  form: { padding: 10, backgroundColor: '#eee', borderRadius: 10 }
});