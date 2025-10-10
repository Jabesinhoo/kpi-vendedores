// backend/src/controllers/kpiVentaDiariaController.js
import KpiVentaDiaria from '../models/KpiVentaDiaria.js';
import Vendedor from '../models/Vendedor.js';
import { Op } from 'sequelize';
import { esDiaLaboral, calculosPrecisos } from '../../utils/formatters.js';

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

            console.log('📅 Fecha recibida:', fecha);
            console.log('📅 Tipo:', typeof fecha);
            console.log('📅 Body completo:', req.body);

            const registradoPorUsuarioId = req.user.id;

            // ✅ SI NO NECESITAS VALIDAR DÍAS LABORALES, COMENTA ESTO:
            /*
            if (!esDiaLaboral(fecha)) {
                return res.status(400).json({
                    error: 'No se pueden registrar ventas los domingos ni días festivos'
                });
            }
            */

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

            // ✅ CÁLCULOS PRECISOS CON LAS NUEVAS FUNCIONES
            const montosVenta = ventas.map(v => parseFloat(v.montoVenta) || 0);
            const totalVentas = calculosPrecisos.sumarDecimales(montosVenta);
            
            const diasTrabajados = ventas.filter(v => v.asistencia).length;
            const diasFaltados = ventas.filter(v => !v.asistencia).length;
            
            const promedioVentas = calculosPrecisos.dividirConPrecision(
                totalVentas, 
                diasTrabajados, 
                2
            );

            // ✅ PROMEDIOS DE CONDUCTA PRECISOS
            const evaluacionesConPuntuacion = ventas.filter(v =>
                v.aprendizajePuntuacion && v.vestimentaPuntuacion && v.areaPuntuacion
            );

            const promediosConducta = {
                aprendizaje: calculosPrecisos.calcularPromedio(
                    evaluacionesConPuntuacion.map(v => v.aprendizajePuntuacion), 2
                ),
                vestimenta: calculosPrecisos.calcularPromedio(
                    evaluacionesConPuntuacion.map(v => v.vestimentaPuntuacion), 2
                ),
                area: calculosPrecisos.calcularPromedio(
                    evaluacionesConPuntuacion.map(v => v.areaPuntuacion), 2
                )
            };

            return res.json({
                data: {
                    ventas,
                    resumen: {
                        totalVentas: Number(totalVentas.toFixed(2)),
                        diasTrabajados,
                        diasFaltados,
                        promedioVentas: Number(promedioVentas.toFixed(2)),
                        totalDias: ventas.length,
                        promediosConducta: {
                            aprendizaje: Number(promediosConducta.aprendizaje.toFixed(2)),
                            vestimenta: Number(promediosConducta.vestimenta.toFixed(2)),
                            area: Number(promediosConducta.area.toFixed(2))
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error en getResumenMensual:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    },

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