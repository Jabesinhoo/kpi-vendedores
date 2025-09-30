// backend/src/controllers/vendedorController.js
import Vendedor from '../models/Vendedor.js';
import KpiVentaDiaria from '../models/KpiVentaDiaria.js';
import KpiEvaluacionMensual from '../models/KpiEvaluacionMensual.js';
import { Op } from 'sequelize';

export const vendedorController = {
    async getVendedoresActivos(req, res) {
        try {
            const vendedores = await Vendedor.findAll({
                where: { activo: true },
                order: [['nombre', 'ASC']]
            });

            return res.json({ data: vendedores });
        } catch (error) {
            console.error('Error en getVendedoresActivos:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    },

    async createVendedor(req, res) {
        try {
            const { nombre, fechaIngreso } = req.body;

            const vendedor = await Vendedor.create({
                nombre,
                fechaIngreso: fechaIngreso || new Date(),
                activo: true
            });

            return res.status(201).json({
                message: 'Vendedor creado exitosamente',
                data: vendedor
            });
        } catch (error) {
            console.error('Error en createVendedor:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    },

    async getDashboardVendedor(req, res) {
        try {
            const { id } = req.params;
            const { mes, anio } = req.query;

            const vendedor = await Vendedor.findByPk(id);
            
            if (!vendedor) {
                return res.status(404).json({ error: 'Vendedor no encontrado' });
            }

            // Obtener ventas del mes
            const ventas = await KpiVentaDiaria.findAll({
                where: {
                    vendedorId: id,
                    fecha: {
                        [Op.between]: [
                            new Date(anio, mes - 1, 1),
                            new Date(anio, mes, 0)
                        ]
                    }
                },
                order: [['fecha', 'DESC']]
            });

            // Obtener evaluación del mes
            const evaluacion = await KpiEvaluacionMensual.findOne({
                where: {
                    vendedorId: id,
                    mes: parseInt(mes),
                    anio: parseInt(anio)
                }
            });

            return res.json({
                data: {
                    vendedor,
                    ventas,
                    evaluacion
                }
            });
        } catch (error) {
            console.error('Error en getDashboardVendedor:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }
};