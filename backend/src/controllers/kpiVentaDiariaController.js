import KpiVentaDiaria from '../models/KpiVentaDiaria.js';
import Vendedor from '../models/Vendedor.js';
import { Op } from 'sequelize';
import { esDiaLaboral } from '../../utils/formatters.js';

export const kpiVentaDiariaController = {
    async upsertVentaDiaria(req, res) {
        try {
            const { 
                vendedorId, 
                fecha, 
                montoVenta, 
                asistencia,
                aprendizajePuntuacion,
                vestimentaPuntuacion,
                areaPuntuacion
            } = req.body;
            
            const registradoPorUsuarioId = req.user.id;

            // Validar que no sea domingo
            if (!esDiaLaboral(fecha)) {
                return res.status(400).json({ 
                    error: 'No se pueden registrar ventas los domingos ni días festivos' 
                });
            }

            // Validar que si hay asistencia, debe haber puntuaciones
            if (asistencia) {
                if (!aprendizajePuntuacion || !vestimentaPuntuacion || !areaPuntuacion) {
                    return res.status(400).json({ 
                        error: 'Si el vendedor asistió, debe completar todas las puntuaciones de conducta' 
                    });
                }
            } else {
                // Si no asistió, no puede haber ventas ni puntuaciones
                if (montoVenta > 0) {
                    return res.status(400).json({ 
                        error: 'No puede haber ventas si el vendedor no asistió' 
                    });
                }
            }

            const [venta, created] = await KpiVentaDiaria.upsert({
                vendedorId,
                fecha,
                montoVenta: parseFloat(montoVenta) || 0,
                asistencia,
                aprendizajePuntuacion: asistencia ? parseInt(aprendizajePuntuacion) : null,
                vestimentaPuntuacion: asistencia ? parseInt(vestimentaPuntuacion) : null,
                areaPuntuacion: asistencia ? parseInt(areaPuntuacion) : null,
                registradoPorUsuarioId
            }, {
                returning: true
            });

            return res.status(created ? 201 : 200).json({
                message: created ? 'Registro diario guardado' : 'Registro diario actualizado',
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
                whereClause.vendedorId = vendedorId;
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
    },

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

            // Calcular estadísticas con montos en pesos
            const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.montoVenta), 0);
            const diasTrabajados = ventas.filter(v => v.asistencia).length;
            const diasFaltados = ventas.filter(v => !v.asistencia).length;
            const promedioVentas = diasTrabajados > 0 ? totalVentas / diasTrabajados : 0;

            // Calcular promedios de conducta
            const evaluacionesConPuntuacion = ventas.filter(v => 
                v.aprendizajePuntuacion && v.vestimentaPuntuacion && v.areaPuntuacion
            );
            
            let promediosConducta = { aprendizaje: 0, vestimenta: 0, area: 0 };
            if (evaluacionesConPuntuacion.length > 0) {
                promediosConducta = {
                    aprendizaje: evaluacionesConPuntuacion.reduce((sum, v) => sum + v.aprendizajePuntuacion, 0) / evaluacionesConPuntuacion.length,
                    vestimenta: evaluacionesConPuntuacion.reduce((sum, v) => sum + v.vestimentaPuntuacion, 0) / evaluacionesConPuntuacion.length,
                    area: evaluacionesConPuntuacion.reduce((sum, v) => sum + v.areaPuntuacion, 0) / evaluacionesConPuntuacion.length
                };
            }

            return res.json({
                data: {
                    ventas,
                    resumen: {
                        totalVentas,
                        diasTrabajados,
                        diasFaltados,
                        promedioVentas,
                        totalDias: ventas.length,
                        promediosConducta
                    }
                }
            });
        } catch (error) {
            console.error('Error en getResumenMensual:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    },

    // Nuevo endpoint para obtener registro específico por fecha y vendedor
    async getRegistroPorFecha(req, res) {
        try {
            const { vendedorId, fecha } = req.params;

            const registro = await KpiVentaDiaria.findOne({
                where: {
                    vendedorId,
                    fecha
                },
                include: [{
                    model: Vendedor,
                    as: 'vendedor',
                    attributes: ['id', 'nombre']
                }]
            });

            return res.json({ data: registro });
        } catch (error) {
            console.error('Error en getRegistroPorFecha:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }
};