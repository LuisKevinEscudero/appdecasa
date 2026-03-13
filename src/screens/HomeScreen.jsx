import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { BudgetContext } from '../context/BudgetContext';
import { Ionicons } from '@expo/vector-icons';
import PieChart from 'react-native-pie-chart'; // <--- Nueva importación

const formatearMesVisual = (mesStr) => {
  if (!mesStr) return "";
  const [year, month] = mesStr.split('-');
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${meses[parseInt(month) - 1]} ${year}`;
};

export default function HomeScreen() {
  const { totalIngresos, totalGastado, categorias, gastos, registrarMovimientoGasto, mesActivo, cambiarMesActivo } = useContext(BudgetContext);
  
  const [nombreGasto, setNombreGasto] = useState('');
  const [montoGasto, setMontoGasto] = useState('');
  const [catSeleccionada, setCatSeleccionada] = useState(categorias[0]?.id);

  const saldoRestante = totalIngresos - totalGastado;

  // --- 1. LÓGICA DEL GRÁFICO (REVISADA Y LIMPIA) ---
  const widthAndHeight = 180;
  const series = [];
  const leyenda = []; 
  const coloresBase = ['#ff5252', '#03dac6', '#ffeb3b', '#4caf50', '#ff9800', '#9c27b0', '#2196f3'];

  // Solo recorremos las categorías UNA VEZ
  categorias.forEach((cat, index) => {
    const gastado = gastos
      .filter(g => g.categoriaId === cat.id)
      .reduce((acc, curr) => acc + curr.monto, 0);

    if (gastado > 0) {
      const colorAsignado = coloresBase[index % coloresBase.length];
      
      // Formato correcto para la nueva versión de PieChart
      series.push({ 
        value: gastado, 
        color: colorAsignado 
      });

      // Datos para la leyenda visual
      leyenda.push({ 
        nombre: cat.nombre, 
        color: colorAsignado, 
        gastado 
      });
    }
  });

  const registrarGasto = () => {
    if (!montoGasto || !nombreGasto) return Alert.alert("Error", "Rellena los campos");
    registrarMovimientoGasto({ nombre: nombreGasto, monto: parseFloat(montoGasto), categoriaId: catSeleccionada });
    setMontoGasto(''); setNombreGasto('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        
        {/* SELECTOR DE MESES */}
        <View style={styles.selectorMes}>
          <TouchableOpacity onPress={() => cambiarMesActivo('anterior')} style={styles.btnMes}>
            <Ionicons name="chevron-back" size={24} color="#6200ee" />
          </TouchableOpacity>
          <Text style={styles.textoMes}>{formatearMesVisual(mesActivo)}</Text>
          <TouchableOpacity onPress={() => cambiarMesActivo('siguiente')} style={styles.btnMes}>
            <Ionicons name="chevron-forward" size={24} color="#6200ee" />
          </TouchableOpacity>
        </View>

        {/* TARJETA DE SALDO */}
        <View style={styles.cardResumen}>
          <Text style={styles.saludo}>Dinero Disponible</Text>
          <Text style={styles.saldoNumero}>{saldoRestante.toFixed(2)}€</Text>
          
          {/* GRÁFICO (Solo se muestra si hay gastos) */}
          {series.length > 0 ? (
            <>
              <View style={styles.chartContainer}>
                <PieChart
                  widthAndHeight={widthAndHeight}
                  series={series}
                  coverRadius={0.65}
                  coverFill={'#6200ee'}
                />
              </View>
              
              {/* LEYENDA DE COLORES */}
              <View style={styles.leyendaContainer}>
                {leyenda.map((item, idx) => (
                  <View key={idx} style={styles.leyendaItem}>
                    <View style={[styles.circuloColor, { backgroundColor: item.color }]} />
                    <Text style={styles.leyendaTexto}>{item.nombre}: {item.gastado}€</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={{color: '#e1d0ff', marginTop: 20}}>No hay gastos registrados aún</Text>
          )}
        </View>

        {/* GASTO RÁPIDO */}
        <View style={styles.cardGasto}>
          <Text style={styles.seccionTitulo}>Añadir Gasto Rápido</Text>
          <TextInput placeholder="¿En qué has gastado?" style={styles.input} value={nombreGasto} onChangeText={setNombreGasto} />
          <TextInput placeholder="Monto €" keyboardType="numeric" style={styles.input} value={montoGasto} onChangeText={setMontoGasto} />
          
          <View style={styles.selector}>
            {categorias.map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.chip, catSeleccionada === cat.id && styles.chipActivo]}
                onPress={() => setCatSeleccionada(cat.id)}
              >
                <Text style={[styles.chipText, catSeleccionada === cat.id && styles.textBlanco]}>{cat.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.boton} onPress={registrarGasto}>
            <Text style={styles.botonTexto}>Registrar Gasto</Text>
          </TouchableOpacity>
        </View>

        {/* BARRAS DE PROGRESO */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Estado por Categoría</Text>
          {categorias.map(cat => {
            const gastadoCat = gastos.filter(g => g.categoriaId === cat.id).reduce((acc, curr) => acc + curr.monto, 0);
            const porcentaje = cat.asignado > 0 ? (gastadoCat / cat.asignado) : 0;
            return (
              <View key={cat.id} style={styles.contenedorBarra}>
                <View style={styles.infoBarra}>
                  <Text style={styles.nombreCat}>{cat.nombre}</Text>
                  <Text style={styles.cifrasBarra}>{gastadoCat.toFixed(2)}€ / {cat.asignado}€</Text>
                </View>
                <View style={styles.barraFondo}>
                  <View style={[styles.barraColor, { width: `${Math.min(porcentaje * 100, 100)}%`, backgroundColor: porcentaje > 0.9 ? '#ff5252' : '#03dac6' }]} />
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
  selectorMes: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, gap: 20 },
  btnMes: { padding: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  textoMes: { fontSize: 20, fontWeight: 'bold', color: '#333', minWidth: 160, textAlign: 'center' },
  cardResumen: { backgroundColor: '#6200ee', padding: 25, borderRadius: 30, alignItems: 'center', marginBottom: 15, elevation: 8 },
  saludo: { color: '#e1d0ff', fontSize: 14, textTransform: 'uppercase' },
  saldoNumero: { color: '#fff', fontSize: 38, fontWeight: 'bold' },
  chartContainer: { marginTop: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
  cardGasto: { backgroundColor: '#fff', padding: 20, borderRadius: 25, marginBottom: 15, elevation: 3 },
  seccion: { backgroundColor: '#fff', padding: 20, borderRadius: 25, marginBottom: 20 },
  seccionTitulo: { fontSize: 17, fontWeight: 'bold', marginBottom: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 15, padding: 8, fontSize: 16 },
  selector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#f0f0f0', borderRadius: 20 },
  chipActivo: { backgroundColor: '#6200ee' },
  chipText: { fontSize: 13 },
  textBlanco: { color: '#fff', fontWeight: 'bold' },
  boton: { backgroundColor: '#03dac6', padding: 16, borderRadius: 15, alignItems: 'center' },
  botonTexto: { fontWeight: 'bold', fontSize: 16 },
  contenedorBarra: { marginBottom: 18 },
  infoBarra: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  nombreCat: { fontSize: 14, fontWeight: '500' },
  cifrasBarra: { fontSize: 13, color: '#777' },
  barraFondo: { height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  barraColor: { height: '100%', borderRadius: 5 },
  leyendaContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15, gap: 10 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  circuloColor: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  leyendaTexto: { color: '#fff', fontSize: 13, fontWeight: '500' },
});