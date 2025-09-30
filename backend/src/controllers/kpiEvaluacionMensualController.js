// backend/src/controllers/kpiEvaluacionMensualController.js
import KpiEvaluacionMensual from '../models/KpiEvaluacionMensual.js';
import Vendedor from '../models/Vendedor.js';

export const kpiEvaluacionMensualController = {
    async upsertEvaluacion(req, res) {
        try {
            const { vendedorId, mes, anio, aprendizajePuntuacion, vestimentaAreaPuntuacion } = req.body;
            const evaluadorId = req.user.id;

            const [evaluacion, created] = await KpiEvaluacionMensual.upsert({
                vendedorId,
                mes,
                anio,
                aprendizajePuntuacion,
                vestimentaAreaPuntuacion,
                evaluadorId
            }, {
                returning: true
            });

            return res.status(created ? 201 : 200).json({
                message: created ? 'Evaluación creada' : 'Evaluación actualizada',
                data: evaluacion
            });
        } catch (error) {
            console.error('Error en upsertEvaluacion:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    },

    async getEvaluacionesByVendedor(req, res) {
        try {
            const { vendedorId } = req.params;

            const evaluaciones = await KpiEvaluacionMensual.findAll({
                where: { vendedorId },
                include: [{
                    model: Vendedor,
                    as: 'vendedor',
                    attributes: ['id', 'nombre']
                }],
                order: [['anio', 'DESC'], ['mes', 'DESC']]
            });

            return res.json({ data: evaluaciones });
        } catch (error) {
            console.error('Error en getEvaluacionesByVendedor:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }
};