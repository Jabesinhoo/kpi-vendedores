// backend/src/routes/kpiRoutes.js
import express from 'express';
import { authenticateToken, isAdmin } from "../middlewares/auth.js";
import { validateVentaDiaria, validateEvaluacionMensual } from '../middlewares/validationMiddleware.js';
import { kpiVentaDiariaController } from '../controllers/kpiVentaDiariaController.js';
import { kpiEvaluacionMensualController } from '../controllers/kpiEvaluacionMensualController.js';
import { vendedorController } from '../controllers/vendedorController.js';
import { dashboardController } from '../controllers/dashboardController.js';

const router = express.Router();


router.get('/vendedores', authenticateToken, vendedorController.getVendedoresActivos);
router.post('/vendedores', authenticateToken, vendedorController.createVendedor);
router.get('/vendedores/:id/dashboard', authenticateToken, vendedorController.getDashboardVendedor);
router.patch('/vendedores/:id/toggle-activo', authenticateToken, vendedorController.toggleVendedorActivo);


router.get('/ventas-diarias/vendedor/:vendedorId/fecha/:fecha', authenticateToken, kpiVentaDiariaController.getRegistroPorFecha);
router.get('/ventas-diarias/vendedor/:vendedorId', authenticateToken, kpiVentaDiariaController.getVentasByVendedor);
router.get('/ventas-diarias/resumen/:vendedorId/:mes/:anio', authenticateToken, kpiVentaDiariaController.getResumenMensual);
router.post('/ventas-diarias', authenticateToken, kpiVentaDiariaController.upsertVentaDiaria);
router.get('/dashboard/:vendedorId/:mes/:anio', authenticateToken, dashboardController.getDashboardData);

router.post('/evaluaciones-mensuales', authenticateToken, validateEvaluacionMensual, kpiEvaluacionMensualController.upsertEvaluacion);
router.get('/evaluaciones-mensuales/vendedor/:vendedorId', authenticateToken, kpiEvaluacionMensualController.getEvaluacionesByVendedor);

router.get('/ventas-diarias/vendedor/all', authenticateToken, async (req, res) => {
  try {
    const ventas = await KpiVentaDiaria.findAll({
      include: [{
        model: Vendedor,
        as: 'vendedor',
        attributes: ['id', 'nombre']
      }],
      order: [['fecha', 'DESC']],
      limit: 10
    });
    return res.json({ data: ventas });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;