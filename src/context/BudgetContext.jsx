import React, { createContext, useState, useEffect } from "react"; // Quitamos Alert de aquí
import { Alert } from "react-native"; // <--- Añadimos esta línea nueva
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BudgetContext = createContext();

// Función de ayuda para obtener el mes actual en formato "YYYY-MM"
const obtenerMesActual = () => {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
};

export const BudgetProvider = ({ children }) => {
  // Estado principal: El mes que estamos viendo actualmente
  const [mesActivo, setMesActivo] = useState(obtenerMesActual());

  // Estado que guarda TODO el historial. Las claves son los meses ("2026-03")
  const [historial, setHistorial] = useState({});

  const [usuarios, setUsuarios] = useState([
    { id: "1", nombre: "Kevin", color: "#1d0d01" },
    { id: "2", nombre: "Fatima", color: "#03dac6" },
  ]);

  const coloresDisponibles = [
    "#ff9800",
    "#e91e63",
    "#4caf50",
    "#2196f3",
    "#9c27b0",
  ];

  // Categorías por defecto si la app está vacía
  const categoriasBase = [
    { id: "1", nombre: "Comida", asignado: 0, tipoPago: "tarjeta" },
    { id: "2", nombre: "Mascota", asignado: 0, tipoPago: "tarjeta" },
    { id: "3", nombre: "Bebé", asignado: 0, tipoPago: "tarjeta" },
    { id: "4", nombre: "Ocio", asignado: 0, tipoPago: "tarjeta" },
  ];

  // --- 1. CARGAR DATOS AL INICIAR ---
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datosGuardados = await AsyncStorage.getItem(
          "@mis_finanzas_mensuales",
        );
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
      AsyncStorage.setItem(
        "@mis_finanzas_mensuales",
        JSON.stringify(historial),
      );
    }
  }, [historial]);

  // --- LÓGICA DE MESES ---
  const iniciarNuevoMes = (mes, historialActual) => {
    // Buscamos cuál fue el último mes registrado para copiar sus categorías
    const mesesGuardados = Object.keys(historialActual).sort();
    const ultimoMes =
      mesesGuardados.length > 0
        ? mesesGuardados[mesesGuardados.length - 1]
        : null;

    // Copiamos las categorías del último mes, o usamos las base
    let categoriasHeredadas = categoriasBase;
    if (ultimoMes && historialActual[ultimoMes].categorias) {
      // Copiamos las categorías pero ponemos "asignado" a 0 (opcional, puedes quitarlo si prefieres mantener el presupuesto)
      categoriasHeredadas = historialActual[ultimoMes].categorias.map(
        (cat) => ({ ...cat, asignado: 0, tipoPago: cat.tipoPago || "tarjeta" }),
      );
    }

    const nuevoEstado = {
      ...historialActual,
      [mes]: {
        ingresos: [],
        gastos: [],
        categorias: categoriasHeredadas,
      },
    };
    setHistorial(nuevoEstado);
  };

  const cambiarMesActivo = (direccion) => {
    const [year, month] = mesActivo.split("-");
    let fecha = new Date(year, parseInt(month) - 1, 1);

    if (direccion === "anterior") fecha.setMonth(fecha.getMonth() - 1);
    if (direccion === "siguiente") fecha.setMonth(fecha.getMonth() + 1);

    const nuevoMesStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

    // Si navegamos a un mes futuro que no existe, lo creamos
    if (!historial[nuevoMesStr]) {
      iniciarNuevoMes(nuevoMesStr, historial);
    }
    setMesActivo(nuevoMesStr);
  };

  // --- VARIABLES DERIVADAS PARA EL MES ACTIVO ---
  // Si el historial aún no ha cargado, evitamos errores devolviendo arrays vacíos
  const datosMesActual = historial[mesActivo] || {
    ingresos: [],
    gastos: [],
    categorias: [],
  };
  const ingresos = datosMesActual.ingresos || [];
  const gastos = datosMesActual.gastos || [];
  const categorias = datosMesActual.categorias || [];

  // Cálculos globales del mes activo
  const totalIngresos = ingresos.reduce(
    (acc, item) => acc + parseFloat(item.cantidad || 0),
    0,
  );
  const totalAsignado = categorias.reduce(
    (acc, cat) => acc + parseFloat(cat.asignado || 0),
    0,
  );
  const totalGastado = gastos.reduce(
    (acc, g) => acc + parseFloat(g.monto || 0),
    0,
  );

  const totalAsignadoTarjeta = categorias
    .filter((cat) => cat.tipoPago === "tarjeta" || !cat.tipoPago)
    .reduce((acc, cat) => acc + parseFloat(cat.asignado || 0), 0);

  const totalAsignadoEfectivo = categorias
    .filter((cat) => cat.tipoPago === "efectivo")
    .reduce((acc, cat) => acc + parseFloat(cat.asignado || 0), 0);

  const cambiarTipoPagoCategoria = (id, nuevoTipo) => {
    actualizarMesActivo({
      categorias: categorias.map((cat) =>
        cat.id === id ? { ...cat, tipoPago: nuevoTipo } : cat,
      ),
    });
  };

  // --- CÁLCULO DE APORTACIÓN PROPORCIONAL Y AHORRO INDIVIDUAL ---
  const desgloseUsuarios = usuarios.map((usuario) => {
    // 1. Cuánto ha ingresado este usuario
    const ingresosUsuario = ingresos
      .filter((ing) => ing.usuarioId === usuario.id)
      .reduce((acc, ing) => acc + parseFloat(ing.cantidad || 0), 0);

    // 2. Porcentaje de aportación sobre el total
    const porcentaje = totalIngresos > 0 ? ingresosUsuario / totalIngresos : 0;

    // 3. Cuánto le toca pagar del presupuesto total asignado
    const debePagarAsignado = totalAsignado * porcentaje;

    // --- LÓGICA DE AHORRO INDIVIDUAL ---
    // Calculamos qué le sobra a este usuario tras su parte de los gastos
    const excedenteIndividual = ingresosUsuario - debePagarAsignado;

    // Si el excedente es positivo, ahorra el 30% de SU sobrante
    const ahorroIndividual =
      excedenteIndividual > 0 ? excedenteIndividual * 0.3 : 0;

    // Lo que le queda realmente libre tras pagar y ahorrar
    const disponibleTrasAhorro = excedenteIndividual - ahorroIndividual;

    return {
      ...usuario,
      ingresosTotales: ingresosUsuario,
      porcentaje: porcentaje * 100,
      debePagarAsignado,
      ahorroIndividual, // <--- Nuevo dato
      disponibleTrasAhorro, // <--- Nuevo dato
    };
  });

  // --- FUNCIONES DE ACTUALIZACIÓN (Actualizan solo el mes activo) ---
  const actualizarMesActivo = (nuevosDatos) => {
    setHistorial((prev) => ({
      ...prev,
      [mesActivo]: { ...prev[mesActivo], ...nuevosDatos },
    }));
  };

  // --- CORRECCIÓN EN BUDGETCONTEXT.JS ---
  const agregarIngreso = (concepto, cantidad, usuarioId) => {
    const nuevoIngreso = {
      id: Date.now().toString(),
      concepto: concepto, // <--- Cambiado de 'nombre' a 'concepto'
      cantidad: parseFloat(cantidad) || 0,
      usuarioId: usuarioId, // <--- ¡Esto es lo que faltaba guardar!
      fecha: new Date().toLocaleDateString(),
    };

    actualizarMesActivo({
      ingresos: [...ingresos, nuevoIngreso],
    });
  };

  const registrarMovimientoGasto = (nuevoGasto) => {
    const gastoCompleto = {
      ...nuevoGasto,
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString(),
    };
    actualizarMesActivo({ gastos: [...gastos, gastoCompleto] });
  };

  const agregarCategoria = (nombre) => {
    actualizarMesActivo({
      categorias: [
        ...categorias,
        { id: Date.now().toString(), nombre, asignado: 0, tipoPago: "tarjeta" },
      ],
    });
  };

  const eliminarCategoria = (id) => {
    actualizarMesActivo({
      categorias: categorias.filter((cat) => cat.id !== id),
      gastos: gastos.filter((g) => g.categoriaId !== id),
    });
  };

  const actualizarAsignacion = (id, valor) => {
    actualizarMesActivo({
      categorias: categorias.map((cat) =>
        cat.id === id ? { ...cat, asignado: valor } : cat,
      ),
    });
  };

  const eliminarGasto = (gastoId) => {
    actualizarMesActivo({
      gastos: gastos.filter((g) => g.id !== gastoId),
    });
  };

  const agregarUsuario = (nombre) => {
    const nuevo = {
      id: Date.now().toString(),
      nombre: nombre,
      color: coloresDisponibles[usuarios.length % coloresDisponibles.length],
    };
    setUsuarios([...usuarios, nuevo]);
  };

  const eliminarUsuario = (id) => {
    if (usuarios.length > 1) {
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } else {
      Alert.alert("Error", "Debe quedar al menos un usuario");
    }
  };

  const reiniciarApp = async () => {
    Alert.alert(
      "Reiniciar App",
      "¿Estás seguro? Se borrarán todos los ingresos, gastos, categorías y usuarios de forma permanente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar Todo",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Borramos todo de la memoria del teléfono
              await AsyncStorage.clear();

              // 2. Reseteamos los estados a sus valores iniciales
              setHistorial({});
              setUsuarios([
                { id: "1", nombre: "Kevin", color: "#1d0d01" },
                { id: "2", nombre: "Fatima", color: "#03dac6" },
              ]);
              setMesActivo(obtenerMesActual());

              Alert.alert("Éxito", "La aplicación ha sido reiniciada.");
            } catch (e) {
              console.error("Error al reiniciar", e);
            }
          },
        },
      ],
    );
  };

  return (
    <BudgetContext.Provider
      value={{
        mesActivo,
        cambiarMesActivo,
        ingresos,
        totalIngresos,
        totalAsignado,
        totalGastado,
        categorias,
        gastos,
        agregarIngreso,
        actualizarAsignacion,
        registrarMovimientoGasto,
        agregarCategoria,
        eliminarCategoria,
        eliminarGasto,
        usuarios,
        agregarUsuario,
        eliminarUsuario,
        desgloseUsuarios,
        reiniciarApp,
        totalAsignadoTarjeta,
        totalAsignadoEfectivo,
        cambiarTipoPagoCategoria,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
