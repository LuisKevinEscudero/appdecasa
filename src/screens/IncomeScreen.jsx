import React, { useContext, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, 
  Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { BudgetContext } from '../context/BudgetContext';
import { Ionicons } from '@expo/vector-icons';

export default function IncomeScreen() {
  const { ingresos, usuarios, totalIngresos, agregarIngreso } = useContext(BudgetContext);
  const [concepto, setConcepto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [userSel, setUserSel] = useState(usuarios[0]?.id);

  const handleGuardar = () => {
    if (!concepto || !cantidad) {
      Alert.alert("Error", "Rellena todos los campos");
      return;
    }
    agregarIngreso(concepto, cantidad, userSel);
    setConcepto('');
    setCantidad('');
    Keyboard.dismiss(); // Cierra el teclado al guardar
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        
        {/* LISTA PRINCIPAL (Usamos ListHeaderComponent para el formulario) */}
        <FlatList
          data={ingresos}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          
          // --- ESTO ES LA CLAVE ---
          // Ponemos todo lo que NO es la lista en el Header de la FlatList
          ListHeaderComponent={
            <View onStartShouldSetResponder={() => Keyboard.dismiss()}>
              {/* TARJETA TOTAL */}
              <View style={styles.cardTotal}>
                <Text style={styles.label}>Ingresos Totales</Text>
                <Text style={styles.monto}>{totalIngresos.toFixed(2)}€</Text>
              </View>

              {/* FORMULARIO */}
              <View style={styles.formulario}>
                <Text style={styles.titulo}>Nuevo Ingreso</Text>
                <View style={styles.selectorUser}>
                  {usuarios.map(u => (
                    <TouchableOpacity 
                      key={u.id} 
                      style={[styles.chipUser, { borderColor: u.color }, userSel === u.id && { backgroundColor: u.color }]}
                      onPress={() => setUserSel(u.id)}
                    >
                      <Text style={[styles.textUser, userSel === u.id && { color: '#fff' }]}>{u.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  placeholder="Concepto"
                  style={styles.input}
                  value={concepto}
                  onChangeText={setConcepto}
                />
                <TextInput
                  placeholder="Cantidad €"
                  keyboardType="numeric"
                  style={styles.input}
                  value={cantidad}
                  onChangeText={setCantidad}
                />
                <TouchableOpacity style={styles.boton} onPress={handleGuardar}>
                  <Text style={styles.botonTexto}>Añadir Ingreso</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subtituloLista}>Historial de este mes</Text>
            </View>
          }

          // RENDERIZADO DE LOS ITEMS
          renderItem={({ item }) => {
            const datosUser = usuarios.find(u => u.id === item.usuarioId);
            return (
              <View style={[styles.itemIngreso, { borderLeftWidth: 5, borderLeftColor: datosUser?.color || '#ccc' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nombrePersona, { color: datosUser?.color || '#333' }]}>
                    {datosUser?.nombre || 'Alguien'}
                  </Text>
                  <Text style={styles.conceptoTexto}>{item.concepto}</Text>
                  <Text style={styles.fecha}>{item.fecha}</Text>
                </View>
                <Text style={styles.cantidadItem}>+{(item.cantidad || 0).toFixed(2)}€</Text>
              </View>
            );
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f0f2f5' },
  cardTotal: { 
    backgroundColor: '#6200ee', 
    paddingVertical: 15, // Reducido
    paddingHorizontal: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  label: { color: '#e1d0ff', fontSize: 13 },
  monto: { fontSize: 28, fontWeight: 'bold', color: '#fff' }, // Reducido un poco
  formulario: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  titulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  selectorUser: { flexDirection: 'row', gap: 8, marginBottom: 15, justifyContent: 'center' },
  chipUser: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 2 },
  textUser: { fontWeight: 'bold', fontSize: 12 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 12, padding: 8, fontSize: 16 },
  boton: { backgroundColor: '#03dac6', padding: 12, borderRadius: 10, alignItems: 'center' },
  botonTexto: { fontWeight: 'bold', fontSize: 14 },
  subtituloLista: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, marginLeft: 5 },
  itemIngreso: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    marginBottom: 8 
  },
  nombrePersona: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  conceptoTexto: { fontSize: 15, color: '#333' },
  fecha: { fontSize: 10, color: '#999' },
  cantidadItem: { fontWeight: 'bold', fontSize: 16, color: '#2e7d32' }
});