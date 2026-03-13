import React, { useContext, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { BudgetContext } from '../context/BudgetContext';
import { Ionicons } from '@expo/vector-icons'; // Para el icono de borrar

export default function BudgetScreen() {
  const { 
    totalIngresos, totalAsignado, categorias, gastos, 
    actualizarAsignacion, agregarCategoria, eliminarCategoria 
  } = useContext(BudgetContext);

  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [catDetalle, setCatDetalle] = useState(null);

  // Lógica de ahorro
  const sobrante = totalIngresos - totalAsignado;
  const ahorro30 = sobrante > 0 ? sobrante * 0.30 : 0;
  const disponibleReal = sobrante - ahorro30;

  const handleCrearCategoria = () => {
    if (!nuevaCatNombre) return;
    agregarCategoria(nuevaCatNombre);
    setNuevaCatNombre('');
  };

  const confirmarEliminar = (id, nombre) => {
    Alert.alert(
      "Eliminar Categoría",
      `¿Estás seguro de que quieres borrar "${nombre}"? Se borrarán también sus gastos.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => eliminarCategoria(id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* CARD DE AHORRO */}
      <View style={styles.cardAhorro}>
        <Text style={styles.montoAhorro}>Ahorro (30%): {ahorro30.toFixed(2)}€</Text>
        <Text style={styles.disponible}>Disponible: {disponibleReal.toFixed(2)}€</Text>
      </View>

      {/* FORMULARIO AÑADIR CATEGORÍA */}
      <View style={styles.formAñadir}>
        <TextInput 
          placeholder="Nueva categoría (ej: Gimnasio)" 
          style={styles.inputNueva} 
          value={nuevaCatNombre}
          onChangeText={setNuevaCatNombre}
        />
        <TouchableOpacity style={styles.btnMas} onPress={handleCrearCategoria}>
          <Ionicons name="add-circle" size={32} color="#6200ee" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const gastadoEnCat = gastos.filter(g => g.categoriaId === item.id)
                                     .reduce((acc, curr) => acc + curr.monto, 0);
          return (
            <View style={styles.fila}>
              <TouchableOpacity style={{flex: 1}} onPress={() => { setCatDetalle(item); setModalVisible(true); }}>
                <Text style={styles.nombreCat}>{item.nombre}</Text>
                <Text style={styles.subtexto}>Gastado: {gastadoEnCat.toFixed(2)}€</Text>
              </TouchableOpacity>
              
              <View style={styles.derecha}>
                <TextInput
                  keyboardType="numeric"
                  style={styles.inputMini}
                  onChangeText={(v) => actualizarAsignacion(item.id, parseFloat(v) || 0)}
                  defaultValue={item.asignado.toString()}
                />
                <TouchableOpacity onPress={() => confirmarEliminar(item.id, item.nombre)}>
                  <Ionicons name="trash-outline" size={20} color="#ff5252" style={{marginLeft: 10}} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      
      {/* ... (Aquí se mantiene el Modal de detalles que ya teníamos) ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f8f9fa' },
  cardAhorro: { backgroundColor: '#e8f5e9', padding: 15, borderRadius: 15, marginBottom: 15 },
  montoAhorro: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  disponible: { fontSize: 14, color: '#666' },
  formAñadir: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10 },
  inputNueva: { flex: 1, padding: 10 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', marginBottom: 8, borderRadius: 10, elevation: 2 },
  nombreCat: { fontSize: 16, fontWeight: 'bold' },
  subtexto: { fontSize: 12, color: '#888' },
  derecha: { flexDirection: 'row', alignItems: 'center' },
  inputMini: { borderBottomWidth: 1, borderBottomColor: '#ccc', width: 50, textAlign: 'right', fontSize: 16 }
});