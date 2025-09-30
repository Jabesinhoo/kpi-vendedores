import Vendedor from './Vendedor.js';
import KpiVentaDiaria from './KpiVentaDiaria.js';
import KpiEvaluacionMensual from './KpiEvaluacionMensual.js';
import Usuario from './Usuario.js';

// --- Relaciones para Vendedor ---
// Un Vendedor tiene muchas ventas diarias
Vendedor.hasMany(KpiVentaDiaria, {
    foreignKey: 'vendedorId', 
    as: 'ventasDiarias' 
});
// Un Vendedor tiene muchas evaluaciones mensuales
Vendedor.hasMany(KpiEvaluacionMensual, {
    foreignKey: 'vendedorId', 
    as: 'evaluacionesMensuales' 
});

// --- Relaciones para KPI ---
// Una Venta Diaria pertenece a un Vendedor
KpiVentaDiaria.belongsTo(Vendedor, {
    foreignKey: 'vendedorId',
    as: 'vendedor'
});
// Una Venta Diaria fue registrada por un Usuario
KpiVentaDiaria.belongsTo(Usuario, {
    foreignKey: 'registradoPorUsuarioId',
    as: 'registrador'
});

// Una Evaluación Mensual pertenece a un Vendedor
KpiEvaluacionMensual.belongsTo(Vendedor, {
    foreignKey: 'vendedorId',
    as: 'vendedor'
});
// Una Evaluación Mensual fue hecha por un Usuario
KpiEvaluacionMensual.belongsTo(Usuario, {
    foreignKey: 'evaluadorId',
    as: 'evaluador'
});

// Puedes exportar todos los modelos si quieres, o solo asegúrate de importar este archivo
// en el punto de inicio de tu aplicación para inicializar las relaciones.
export { Vendedor, KpiVentaDiaria, KpiEvaluacionMensual, Usuario };