import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BudgetContext = createContext();

// Función de ayuda para obtener el mes actual en formato "YYYY-MM"
const obtenerMesActual = () => {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
};

export const BudgetProvider = ({ children }) => {
  // Estado principal: El mes que estamos viendo actualmente
  const [mesActivo, setMesActivo] = useState(obtenerMesActual());
  
  // Estado que guarda TODO el historial. Las claves son los meses ("2026-03")
  const [historial, setHistorial] = useState({});

  // Categorías por defecto si la app está vacía
  const categoriasBase = [
    { id: '1', nombre: 'Comida', asignado: 0 },
    { id: '2', nombre: 'Mascota', asignado: 0 },
    { id: '3', nombre: 'Bebé', asignado: 0 },
    { id: '4', nombre: 'Ocio', asignado: 0 },
  ];

  // --- 1. CARGAR DATOS AL INICIAR ---
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datosGuardados = await AsyncStorage.getItem('@mis_finanzas_mensuales');
        if (datosGuardados) {
          const historialParseado = JSON.parse(datosGuardados);
          setHistorial(historialParseado);
          
          // Si el mes actual no existe en el historial, lo creamos
          if (!historialParseado[obtenerMesActual()]) {
            iniciarNuevoMes(obtenerMesActual(), historialParseado);
          }
        } else {
          // Primera vez que abre la app
          iniciarNuevoMes(obtenerMesActual(), {});
        }
      } catch (e) {
        console.error("Error cargando", e);
      }
    };
    cargarDatos();
  }, []);

  // --- 2. GUARDAR DATOS AL CAMBIAR EL HISTORIAL ---
  useEffect(() => {
    if (Object.keys(historial).length > 0) {
      AsyncStorage.setItem('@mis_finanzas_mensuales', JSON.stringify(historial));
    }
  }, [historial]);

  // --- LÓGICA DE MESES ---
  const iniciarNuevoMes = (mes, historialActual) => {
    // Buscamos cuál fue el último mes registrado para copiar sus categorías
    const mesesGuardados = Object.keys(historialActual).sort();
    const ultimoMes = mesesGuardados.length > 0 ? mesesGuardados[mesesGuardados.length - 1] : null;
    
    // Copiamos las categorías del último mes, o usamos las base
    let categoriasHeredadas = categoriasBase;
    if (ultimoMes && historialActual[ultimoMes].categorias) {
      // Copiamos las categorías pero ponemos "asignado" a 0 (opcional, puedes quitarlo si prefieres mantener el presupuesto)
      categoriasHeredadas = historialActual[ultimoMes].categorias.map(cat => ({...cat, asignado: 0}));
    }

    const nuevoEstado = {
      ...historialActual,
      [mes]: {
        ingresos: [],
        gastos: [],
        categorias: categoriasHeredadas
      }
    };
    setHistorial(nuevoEstado);
  };

  const cambiarMesActivo = (direccion) => {
    const [year, month] = mesActivo.split('-');
    let fecha = new Date(year, parseInt(month) - 1, 1);
    
    if (direccion === 'anterior') fecha.setMonth(fecha.getMonth() - 1);
    if (direccion === 'siguiente') fecha.setMonth(fecha.getMonth() + 1);

    const nuevoMesStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    
    // Si navegamos a un mes futuro que no existe, lo creamos
    if (!historial[nuevoMesStr]) {
      iniciarNuevoMes(nuevoMesStr, historial);
    }
    setMesActivo(nuevoMesStr);
  };

  // --- VARIABLES DERIVADAS PARA EL MES ACTIVO ---
  // Si el historial aún no ha cargado, evitamos errores devolviendo arrays vacíos
  const datosMesActual = historial[mesActivo] || { ingresos: [], gastos: [], categorias: [] };
  const ingresos = datosMesActual.ingresos;
  const gastos = datosMesActual.gastos;
  const categorias = datosMesActual.categorias;

  // Cálculos globales del mes activo
  const totalIngresos = ingresos.reduce((acc, item) => acc + parseFloat(item.cantidad || 0), 0);
  const totalAsignado = categorias.reduce((acc, cat) => acc + parseFloat(cat.asignado || 0), 0);
  const totalGastado = gastos.reduce((acc, g) => acc + parseFloat(g.monto || 0), 0);

  // --- FUNCIONES DE ACTUALIZACIÓN (Actualizan solo el mes activo) ---
  const actualizarMesActivo = (nuevosDatos) => {
    setHistorial(prev => ({
      ...prev,
      [mesActivo]: { ...prev[mesActivo], ...nuevosDatos }
    }));
  };

  const agregarIngreso = (nuevo) => actualizarMesActivo({ ingresos: [...ingresos, nuevo] });
  
  const registrarMovimientoGasto = (nuevoGasto) => {
    const gastoCompleto = { ...nuevoGasto, id: Date.now().toString(), fecha: new Date().toLocaleDateString() };
    actualizarMesActivo({ gastos: [...gastos, gastoCompleto] });
  };

  const agregarCategoria = (nombre) => {
    actualizarMesActivo({ categorias: [...categorias, { id: Date.now().toString(), nombre, asignado: 0 }] });
  };

  const eliminarCategoria = (id) => {
    actualizarMesActivo({
      categorias: categorias.filter(cat => cat.id !== id),
      gastos: gastos.filter(g => g.categoriaId !== id)
    });
  };

  const actualizarAsignacion = (id, valor) => {
    actualizarMesActivo({
      categorias: categorias.map(cat => cat.id === id ? { ...cat, asignado: valor } : cat)
    });
  };

  return (
    <BudgetContext.Provider value={{
      mesActivo, cambiarMesActivo,
      ingresos, totalIngresos, totalAsignado, totalGastado, categorias, gastos,
      agregarIngreso, actualizarAsignacion, registrarMovimientoGasto,
      agregarCategoria, eliminarCategoria
    }}>
      {children}
    </BudgetContext.Provider>
  );
};