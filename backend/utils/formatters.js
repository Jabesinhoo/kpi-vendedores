// backend/src/utils/formatters.js

// Calcular comisión - MANTENEMOS ESTA QUE ESTÁ BIEN
export const calcularComision = (ventasTotales) => {
    let porcentajeComision = 0;

    if (ventasTotales >= 140000000) {
        porcentajeComision = 1.5; // 1.5% si supera 140M
    } else if (ventasTotales >= 120000000) {
        porcentajeComision = 1.0; // 1% si alcanza 120M
    }

    const montoComision = (ventasTotales * porcentajeComision) / 100;
    
    return {
        porcentaje: porcentajeComision,
        monto: Number(montoComision.toFixed(0))
    };
};

// Calcular KPIs - VERSIÓN SIMPLIFICADA Y EXACTA
export const calcularKPIs = (ventasTotales, diasTrabajados, totalDias, evaluacionPromedio = 0) => {
    const META_BASE = 120_000_000;
    const META_SUPERIOR = 140_000_000;
    
    // Convertir a números para precisión
    const ventas = Number(ventasTotales);
    const diasTrab = Number(diasTrabajados);
    const totalD = Number(totalDias);
    const evalPromedio = Number(evaluacionPromedio);

    // === 1️⃣ PORCENTAJE DE CUMPLIMIENTO REAL ===
    const porcentajeCumplimiento = Number(((ventas / META_BASE) * 100).toFixed(1));

    // === 2️⃣ KPI DE VENTAS - BASADO EN REGLAS CLARAS ===
    let kpiVentas = 0;
    let diaLibre = false;

    if (ventas >= META_SUPERIOR) {
        kpiVentas = 100; // 100% por superar 140M
        diaLibre = true;
    } else if (ventas >= META_BASE) {
        kpiVentas = 100; // 100% por cumplir 120M
    } else {
        // Porcentaje directo de lo que llevó de la meta base
        kpiVentas = Number(((ventas / META_BASE) * 100).toFixed(1));
    }

    // === 3️⃣ KPI DE ASISTENCIA - PORCENTAJE DIRECTO ===
    const porcentajeAsistencia = totalD > 0 ? 
        Number(((diasTrab / totalD) * 100).toFixed(1)) : 0;

    // === 4️⃣ KPI DE CONDUCTA - CONVERTIR 1-5 A PORCENTAJE 0-100 ===
    const kpiConducta = Number(((evalPromedio / 5) * 100).toFixed(1));

    // === 5️⃣ KPI TOTAL - PROMEDIO SIMPLE DE LOS 3 COMPONENTES ===
    const kpiTotal = Number(((kpiVentas + porcentajeAsistencia + kpiConducta) / 3).toFixed(1));

    return {
        ventasTotales: ventas,
        porcentajeCumplimiento,
        kpiVentas,
        porcentajeAsistencia,
        kpiConducta,
        kpiTotal,
        diaLibre,
        evaluacionPromedio: evalPromedio
    };
};

// Función auxiliar para cálculos precisos - MANTENEMOS
export const calculosPrecisos = {
    sumarDecimales: (valores) => {
        return valores.reduce((total, valor) => 
            (Number(total) * 100 + Number(valor) * 100) / 100, 0
        );
    },
    
    dividirConPrecision: (dividendo, divisor, decimales = 2) => {
        if (divisor === 0) return 0;
        return Number((dividendo / divisor).toFixed(decimales));
    },
    
    calcularPromedio: (valores, decimales = 2) => {
        const valoresValidos = valores.filter(v => v != null && !isNaN(v));
        if (valoresValidos.length === 0) return 0;
        
        const suma = calculosPrecisos.sumarDecimales(valoresValidos);
        return calculosPrecisos.dividirConPrecision(suma, valoresValidos.length, decimales);
    }
};

// Las otras funciones las mantenemos igual
export const esDiaLaboral = (fecha) => {
    const date = new Date(fecha);
    return date.getDay() !== 0;
};

export const getDiasLaboralesMes = (mes, anio) => {
    const fecha = new Date(anio, mes - 1, 1);
    const dias = [];

    while (fecha.getMonth() === mes - 1) {
        if (esDiaLaboral(fecha)) {
            dias.push(new Date(fecha));
        }
        fecha.setDate(fecha.getDate() + 1);
    }

    return dias;
};

export const formatPesos = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
};