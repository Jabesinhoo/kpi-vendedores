import { Op } from 'sequelize';
import Vendedor from '../models/Vendedor.js';
import KpiVentaDiaria from '../models/KpiVentaDiaria.js';
import { calcularComision, calcularKPIs, getDiasLaboralesMes } from '../../utils/formatters.js';

export const dashboardController = {
    async getDashboardData(req, res) {
        try {
            const { vendedorId, mes, anio } = req.params;

            // Obtener ventas del mes
            const ventas = await KpiVentaDiaria.findAll({
                where: {
                    vendedorId,
                    fecha: {
                        [Op.between]: [
                            new Date(anio, mes - 1, 1),
                            new Date(anio, mes, 0)
                        ]
                    }
                },
                order: [['fecha', 'ASC']]
            });

            const ventasTotales = ventas.reduce((sum, venta) => sum + parseFloat(venta.montoVenta), 0);
            const diasTrabajados = ventas.filter(v => v.asistencia).length;
            const totalDias = getDiasLaboralesMes(parseInt(mes), parseInt(anio)).length;

            const evaluacionesConPuntuacion = ventas.filter(v => 
                v.aprendizajePuntuacion && v.vestimentaPuntuacion && v.areaPuntuacion
            );
            
            let evaluacionPromedio = 0;
            if (evaluacionesConPuntuacion.length > 0) {
                const totalPuntuacion = evaluacionesConPuntuacion.reduce((sum, v) => 
                    sum + v.aprendizajePuntuacion + v.vestimentaPuntuacion + v.areaPuntuacion, 0
                );
                evaluacionPromedio = totalPuntuacion / (evaluacionesConPuntuacion.length * 3);
            }

            // Calcular KPIs y comisión
            const kpis = calcularKPIs(ventasTotales, diasTrabajados, totalDias, evaluacionPromedio);
            const comision = calcularComision(ventasTotales);

            return res.json({
                data: {
                    ventasTotales,
                    kpis,
                    comision,
                    ventasDiarias: ventas,
                    diasTrabajados,
                    totalDias,
                    evaluacionPromedio
                }
            });
        } catch (error) {
            console.error('Error en getDashboardData:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }
};