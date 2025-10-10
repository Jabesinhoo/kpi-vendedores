// backend/src/controllers/dashboardController.js
import { Op } from 'sequelize';
import Vendedor from '../models/Vendedor.js';
import KpiVentaDiaria from '../models/KpiVentaDiaria.js';
import { calcularComision, calcularKPIs, getDiasLaboralesMes, calculosPrecisos } from '../../utils/formatters.js';

export const dashboardController = {
    async getDashboardData(req, res) {
        try {
            const { vendedorId, mes, anio } = req.params;
            
            console.log('📊 Dashboard request:', { vendedorId, mes, anio });

            // Validar que vendedorId sea un UUID válido
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(vendedorId)) {
                return res.status(400).json({ 
                    error: 'ID de vendedor no válido' 
                });
            }

            // Verificar si el vendedor existe
            const vendedor = await Vendedor.findByPk(vendedorId);
            if (!vendedor) {
                return res.status(404).json({ 
                    error: 'Vendedor no encontrado' 
                });
            }

            if (!vendedor.activo) {
                return res.status(400).json({ 
                    error: 'Vendedor inactivo' 
                });
            }

            // Convertir mes y anio a números
            const mesNum = parseInt(mes);
            const anioNum = parseInt(anio);

            if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
                return res.status(400).json({ 
                    error: 'Mes no válido' 
                });
            }

            if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2030) {
                return res.status(400).json({ 
                    error: 'Año no válido' 
                });
            }

            // Obtener ventas del mes
            const fechaInicio = new Date(anioNum, mesNum - 1, 1);
            const fechaFin = new Date(anioNum, mesNum, 0);

            const ventas = await KpiVentaDiaria.findAll({
                where: {
                    vendedorId: vendedorId, // ✅ Usar el UUID directamente
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    }
                },
                order: [['fecha', 'ASC']]
            });

            console.log(`📈 Ventas encontradas: ${ventas.length} registros`);

            // Si no hay ventas, retornar estructura vacía pero válida
            if (ventas.length === 0) {
                const totalDias = getDiasLaboralesMes(mesNum, anioNum).length;
                
                return res.json({
                    success: true,
                    data: {
                        ventasTotales: 0,
                        kpis: calcularKPIs(0, 0, totalDias, 0),
                        comision: calcularComision(0),
                        ventasDiarias: [],
                        diasTrabajados: 0,
                        totalDias,
                        evaluacionPromedio: 0
                    }
                });
            }

            // ✅ CÁLCULOS PRECISOS
            const montosVenta = ventas.map(v => parseFloat(v.montoVenta) || 0);
            const ventasTotales = calculosPrecisos.sumarDecimales(montosVenta);
            
            const diasTrabajados = ventas.filter(v => v.asistencia).length;
            const totalDias = getDiasLaboralesMes(mesNum, anioNum).length;

            // ✅ EVALUACIÓN PROMEDIO PRECISA
            const evaluacionesValidas = ventas.filter(v => 
                v.aprendizajePuntuacion && v.vestimentaPuntuacion && v.areaPuntuacion
            );
            
            let evaluacionPromedio = 0;
            if (evaluacionesValidas.length > 0) {
                const promediosDiarios = evaluacionesValidas.map(v => 
                    calculosPrecisos.calcularPromedio([
                        v.aprendizajePuntuacion, 
                        v.vestimentaPuntuacion, 
                        v.areaPuntuacion
                    ], 2)
                );
                evaluacionPromedio = calculosPrecisos.calcularPromedio(promediosDiarios, 2);
            }

            // ✅ KPIs CORREGIDOS
            const kpis = calcularKPIs(ventasTotales, diasTrabajados, totalDias, evaluacionPromedio);
            const comision = calcularComision(ventasTotales);

            const responseData = {
                ventasTotales: Math.round(ventasTotales),
                kpis,
                comision,
                ventasDiarias: ventas,
                diasTrabajados,
                totalDias,
                evaluacionPromedio: Number(evaluacionPromedio.toFixed(2))
            };

            console.log('📊 Dashboard response:', responseData);

            return res.json({
                success: true,
                data: responseData
            });

        } catch (error) {
            console.error('❌ Error en getDashboardData:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Error del servidor',
                message: error.message 
            });
        }
    }
};