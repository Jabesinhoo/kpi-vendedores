// backend/src/controllers/kpiVentaDiariaController.js
import KpiVentaDiaria from '../models/KpiVentaDiaria.js';
import Vendedor from '../models/Vendedor.js';
import { Op } from 'sequelize';

export const kpiVentaDiariaController = {
    async upsertVentaDiaria(req, res) {
        try {
            const { vendedorId, fecha, montoVentaMillones, asistencia } = req.body;
            const registradoPorUsuarioId = req.user.id;

            const [venta, created] = await KpiVentaDiaria.upsert({
                vendedorId,
                fecha,
                montoVentaMillones,
                asistencia,
                registradoPorUsuarioId
            }, {
                returning: true
            });

            return res.status(created ? 201 : 200).json({
                message: created ? 'Venta registrada' : 'Venta actualizada',
                data: venta
            });
        } catch (error) {
            console.error('Error en upsertVentaDiaria:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    },

    async getVentasByVendedor(req, res) {
    try {
        const { vendedorId } = req.params;
        const { fechaInicio, fechaFin } = req.query;

        const whereClause = {};
        if (vendedorId !== "all") {
            whereClause.vendedorId = parseInt(vendedorId, 10);
        }

        if (fechaInicio && fechaFin) {
            whereClause.fecha = {
                [Op.between]: [fechaInicio, fechaFin]
            };
        }

        const ventas = await KpiVentaDiaria.findAll({
            where: whereClause,
            include: [{
                model: Vendedor,
                as: 'vendedor',
                attributes: ['id', 'nombre']
            }],
            order: [['fecha', 'DESC']]
        });

        return res.json({ data: ventas });
    } catch (error) {
        console.error('Error en getVentasByVendedor:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
}
,

    async getResumenMensual(req, res) {
        try {
            const { vendedorId, mes, anio } = req.params;

            const fechaInicio = new Date(anio, mes - 1, 1);
            const fechaFin = new Date(anio, mes, 0);

            const ventas = await KpiVentaDiaria.findAll({
                where: {
                    vendedorId,
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    }
                },
                order: [['fecha', 'ASC']]
            });

            // Calcular estadísticas
            const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.montoVentaMillones), 0);
            const diasTrabajados = ventas.filter(v => v.asistencia).length;
            const diasFaltados = ventas.filter(v => !v.asistencia).length;
            const promedioVentas = diasTrabajados > 0 ? totalVentas / diasTrabajados : 0;

            return res.json({
                data: {
                    ventas,
                    resumen: {
                        totalVentas: totalVentas.toFixed(2),
                        diasTrabajados,
                        diasFaltados,
                        promedioVentas: promedioVentas.toFixed(2),
                        totalDias: ventas.length
                    }
                }
            });
        } catch (error) {
            console.error('Error en getResumenMensual:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }
};