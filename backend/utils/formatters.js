// Formatear números como pesos colombianos
export const formatPesos = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Formatear números con separadores de miles
export const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
};

// Calcular comisión
export const calcularComision = (ventasTotales) => {
    let porcentajeComision = 0;
    
    if (ventasTotales >= 140000000) {
        porcentajeComision = 2.0; // 1.5% si supera 140M
    } else if (ventasTotales >= 120000000) {
        porcentajeComision = 1.0; // 1% si alcanza 120M
    }
    
    return {
        porcentaje: porcentajeComision,
        monto: (ventasTotales * porcentajeComision) / 100
    };
};

// Calcular KPIs según las reglas de negocio
export const calcularKPIs = (ventasTotales, diasTrabajados, totalDias, evaluacionPromedio = 0) => {
    // KPI Ventas (70% máximo)
    let kpiVentas = 0;
    let diaLibre = false;
    
    if (ventasTotales >= 120000000) {
        kpiVentas = 70; // 70% por alcanzar meta base
        
        if (ventasTotales >= 140000000) {
            kpiVentas = 90; // 90% por superar escalón
            diaLibre = true;
        }
    } else {
        // Progresivo hasta 120M
        kpiVentas = (ventasTotales / 120000000) * 70;
    }
    
    // KPI Asistencia & Conducta (10% máximo)
    const porcentajeAsistencia = (diasTrabajados / totalDias) * 100;
    const kpiAsistenciaConducta = Math.min((porcentajeAsistencia * 0.1) + (evaluacionPromedio * 2), 10);
    
    const kpiTotal = Math.min(kpiVentas + kpiAsistenciaConducta, 100);
    
    return {
        kpiVentas: Math.min(kpiVentas, 90),
        kpiAsistenciaConducta,
        kpiTotal,
        diaLibre,
        porcentajeAsistencia
    };
};

// Verificar si es día laboral (excluye domingos)
export const esDiaLaboral = (fecha) => {
    const date = new Date(fecha);
    return date.getDay() !== 0; // 0 es domingo
};

// Obtener días laborales del mes
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

