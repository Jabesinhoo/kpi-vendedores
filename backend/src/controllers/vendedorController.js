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
                order: [['nombre', 'ASC']],
                attributes: ['id', 'nombre', 'activo', 'createdAt'] // Incluir createdAt para mostrar fecha de creación
            });

            return res.json({ data: vendedores });
        } catch (error) {
            console.error('Error en getVendedoresActivos:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    },

    async createVendedor(req, res) {
        try {
            const { nombre } = req.body; // Solo recibir nombre

            // Validar que el nombre no esté vacío
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({ error: 'El nombre del vendedor es requerido' });
            }

            const vendedor = await Vendedor.create({
                nombre: nombre.trim(),
                activo: true
            });

            return res.status(201).json({
                message: 'Vendedor creado exitosamente',
                data: vendedor
            });
        } catch (error) {
            console.error('Error en createVendedor:', error);
            
            // Manejar errores de duplicados u otros errores de base de datos
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'Ya existe un vendedor con ese nombre' });
            }
            
            return res.status(500).json({ error: 'Error del servidor al crear vendedor' });
        }
    },

    async toggleVendedorActivo(req, res) {
        try {
            const { id } = req.params;
            
            const vendedor = await Vendedor.findByPk(id);
            if (!vendedor) {
                return res.status(404).json({ error: 'Vendedor no encontrado' });
            }

            // Cambiar estado activo/inactivo
            vendedor.activo = !vendedor.activo;
            await vendedor.save();

            return res.json({
                message: `Vendedor ${vendedor.activo ? 'activado' : 'desactivado'} exitosamente`,
                data: vendedor
            });
        } catch (error) {
            console.error('Error en toggleVendedorActivo:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    },

    async getDashboardVendedor(req, res) {
        try {
            const { id } = req.params;
            const { mes, anio } = req.query;

            const vendedor = await Vendedor.findByPk(id, {
                attributes: ['id', 'nombre', 'activo', 'createdAt']
            });
            
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