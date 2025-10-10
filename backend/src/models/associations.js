// backend/src/models/associations.js
import Vendedor from './Vendedor.js';
import KpiVentaDiaria from './KpiVentaDiaria.js';
import KpiEvaluacionMensual from './KpiEvaluacionMensual.js';
import Usuario from './Usuario.js';

// --- Relaciones para Vendedor ---
Vendedor.hasMany(KpiVentaDiaria, {
    foreignKey: 'vendedorId', 
    as: 'ventasDiarias' 
});

Vendedor.hasMany(KpiEvaluacionMensual, {
    foreignKey: 'vendedorId', 
    as: 'evaluacionesMensuales' 
});

// --- Relaciones para KPI Venta Diaria ---
KpiVentaDiaria.belongsTo(Vendedor, {
    foreignKey: 'vendedorId', // ✅ Ahora es UUID
    as: 'vendedor'
});

KpiVentaDiaria.belongsTo(Usuario, {
    foreignKey: 'registradoPorUsuarioId',
    as: 'registrador'
});

// --- Relaciones para KPI Evaluación Mensual ---
KpiEvaluacionMensual.belongsTo(Vendedor, {
    foreignKey: 'vendedorId',
    as: 'vendedor'
});

KpiEvaluacionMensual.belongsTo(Usuario, {
    foreignKey: 'evaluadorId',
    as: 'evaluador'
});

export { Vendedor, KpiVentaDiaria, KpiEvaluacionMensual, Usuario };