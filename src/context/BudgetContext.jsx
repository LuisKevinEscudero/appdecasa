import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([
    { id: '1', nombre: 'Comida', asignado: 0 },
    { id: '2', nombre: 'Mascota', asignado: 0 },
    { id: '3', nombre: 'Bebé', asignado: 0 },
    { id: '4', nombre: 'Ocio', asignado: 0 },
  ]);
  const agregarCategoria = (nombre) => {
    const nueva = { 
      id: Date.now().toString(), 
      nombre: nombre, 
      asignado: 0 
    };
    setCategorias([...categorias, nueva]);
  };

  // --- 1. CARGAR DATOS AL INICIAR ---
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datosGuardados = await AsyncStorage.getItem('@mi_app_gastos');
        if (datosGuardados !== null) {
          const { ingresosParsed, gastosParsed, categoriasParsed } = JSON.parse(datosGuardados);
          setIngresos(ingresosParsed || []);
          setGastos(gastosParsed || []);
          setCategorias(categoriasParsed || []);
        }
      } catch (e) {
        console.error("Error cargando datos", e);
      }
    };
    cargarDatos();
  }, []);

  // --- 2. GUARDAR DATOS AUTOMÁTICAMENTE ---
  useEffect(() => {
    const guardarDatos = async () => {
      try {
        const datos = JSON.stringify({
          ingresosParsed: ingresos,
          gastosParsed: gastos,
          categoriasParsed: categorias
        });
        await AsyncStorage.setItem('@mi_app_gastos', datos);
      } catch (e) {
        console.error("Error guardando datos", e);
      }
    };
    guardarDatos();
  }, [ingresos, gastos, categorias]); // Se ejecuta cuando cualquiera de estos cambie


  // --- FUNCIONES DE ACCIÓN ---
  const totalIngresos = ingresos.reduce((acc, item) => acc + parseFloat(item.cantidad || 0), 0);
  const totalAsignado = categorias.reduce((acc, cat) => acc + parseFloat(cat.asignado || 0), 0);
  const totalGastado = gastos.reduce((acc, g) => acc + parseFloat(g.monto || 0), 0);

  const agregarIngreso = (nuevo) => setIngresos([...ingresos, nuevo]);
  
  const actualizarAsignacion = (id, valor) => {
    setCategorias(prev => prev.map(cat => cat.id === id ? { ...cat, asignado: valor } : cat));
  };

  const registrarMovimientoGasto = (nuevoGasto) => {
    setGastos(prev => [...prev, { ...nuevoGasto, id: Date.now().toString(), fecha: new Date().toLocaleDateString() }]);
  };

  const eliminarCategoria = (id) => {
    // Solo permitimos eliminar si el usuario confirma (lo haremos en la UI)
    setCategorias(prev => prev.filter(cat => cat.id !== id));
    // Opcional: podrías filtrar también los gastos asociados a esa categoría
    setGastos(prev => prev.filter(g => g.categoriaId !== id));
  };

  return (
    <BudgetContext.Provider value={{
      ingresos, totalIngresos, totalAsignado, totalGastado, categorias, gastos,
      agregarIngreso, actualizarAsignacion, registrarMovimientoGasto, agregarCategoria, eliminarCategoria
    }}>
      {children}
    </BudgetContext.Provider>
  );
};