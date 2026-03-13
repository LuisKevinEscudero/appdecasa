import React, { useContext, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { BudgetContext } from '../context/BudgetContext';
import { Ionicons } from '@expo/vector-icons';

export default function BudgetScreen() {
  const { 
    totalIngresos, totalAsignado, categorias, gastos, 
    actualizarAsignacion, agregarCategoria, eliminarCategoria, eliminarGasto
  } = useContext(BudgetContext);

  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [catSeleccionada, setCatSeleccionada] = useState(null);

  // Lógica de ahorro
  const sobrante = totalIngresos - totalAsignado;
  const ahorro30 = sobrante > 0 ? sobrante * 0.30 : 0;
  const disponibleReal = sobrante - ahorro30;

  const handleCrearCategoria = () => {
    if (!nuevaCatNombre.trim()) return;
    agregarCategoria(nuevaCatNombre);
    setNuevaCatNombre('');
  };

  const confirmarEliminar = (id, nombre) => {
    Alert.alert(
      "Eliminar Categoría",
      `¿Estás seguro de borrar "${nombre}"? Se perderán sus gastos registrados.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => eliminarCategoria(id) }
      ]
    );
  };

  // Filtrar gastos para el modal
  const gastosDeCategoria = catSeleccionada 
    ? gastos.filter(g => g.categoriaId === catSeleccionada.id)
    : [];

  return (
    <View style={styles.container}>
      {/* HEADER DE AHORRO */}
      <View style={styles.cardAhorro}>
        <Text style={styles.montoAhorro}>Ahorro Sugerido: {ahorro30.toFixed(2)}€</Text>
        <Text style={styles.disponible}>Disponible para asignar: {disponibleReal.toFixed(2)}€</Text>
      </View>

      {/* AÑADIR NUEVA CATEGORÍA */}
      <View style={styles.formAñadir}>
        <TextInput 
          placeholder="Ej: Gimnasio, Suscripciones..." 
          style={styles.inputNueva} 
          value={nuevaCatNombre}
          onChangeText={setNuevaCatNombre}
        />
        <TouchableOpacity style={styles.btnMas} onPress={handleCrearCategoria}>
          <Ionicons name="add-circle" size={35} color="#6200ee" />
        </TouchableOpacity>
      </View>

      {/* LISTADO DE CATEGORÍAS */}
      <FlatList
        data={categorias}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const gastadoEnCat = gastos.filter(g => g.categoriaId === item.id)
                                     .reduce((acc, curr) => acc + curr.monto, 0);
          return (
            <View style={styles.fila}>
              <TouchableOpacity 
                style={{flex: 1}} 
                onPress={() => { setCatSeleccionada(item); setModalVisible(true); }}
              >
                <Text style={styles.nombreCat}>{item.nombre}</Text>
                <Text style={styles.subtexto}>Ver gastos: {gastadoEnCat.toFixed(2)}€</Text>
              </TouchableOpacity>
              
              <View style={styles.derecha}>
                <Text style={styles.labelEuro}>€</Text>
                <TextInput
                  keyboardType="numeric"
                  style={styles.inputAsignado}
                  placeholder="0"
                  onChangeText={(v) => actualizarAsignacion(item.id, parseFloat(v) || 0)}
                  defaultValue={item.asignado > 0 ? item.asignado.toString() : ""}
                />
                <TouchableOpacity onPress={() => confirmarEliminar(item.id, item.nombre)}>
                  <Ionicons name="trash-outline" size={22} color="#ff5252" style={{marginLeft: 15}} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* MODAL DE DETALLES DE GASTOS */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>{catSeleccionada?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.listaGastos}>
              {gastosDeCategoria.length > 0 ? (
                gastosDeCategoria.map((g, idx) => (
                  <View key={g.id || idx} style={styles.itemGasto}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gastoNombre}>{g.nombre}</Text>
                      <Text style={styles.gastoFecha}>{g.fecha}</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.gastoMonto}>-{g.monto.toFixed(2)}€</Text>
                      
                      {/* BOTÓN PARA BORRAR GASTO INDIVIDUAL */}
                      <TouchableOpacity 
                        onPress={() => {
                          Alert.alert(
                            "Borrar Gasto",
                            "¿Eliminar este registro?",
                            [
                              { text: "No" },
                              { text: "Sí", onPress: () => eliminarGasto(g.id) }
                            ]
                          );
                        }}
                        style={{ marginLeft: 15 }}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ff5252" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.textoVacio}>No hay gastos registrados.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f8f9fa' },
  cardAhorro: { backgroundColor: '#e8f5e9', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#c8e6c9' },
  montoAhorro: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  disponible: { fontSize: 14, color: '#666' },
  formAñadir: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, paddingLeft: 15, elevation: 2 },
  inputNueva: { flex: 1, height: 50 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', marginBottom: 8, borderRadius: 12, elevation: 2 },
  nombreCat: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subtexto: { fontSize: 12, color: '#6200ee' },
  derecha: { flexDirection: 'row', alignItems: 'center' },
  labelEuro: { marginRight: 4, color: '#888', fontWeight: 'bold' },
  inputAsignado: { borderBottomWidth: 1, borderBottomColor: '#6200ee', width: 60, textAlign: 'right', fontSize: 16, padding: 2 },
  
  // Estilos del Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  listaGastos: { marginBottom: 20 },
  itemGasto: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  gastoNombre: { fontSize: 16, color: '#333', fontWeight: '500' },
  gastoFecha: { fontSize: 12, color: '#999' },
  gastoMonto: { fontSize: 16, fontWeight: 'bold', color: '#ff5252' },
  textoVacio: { textAlign: 'center', marginTop: 20, color: '#999', fontStyle: 'italic' }
});