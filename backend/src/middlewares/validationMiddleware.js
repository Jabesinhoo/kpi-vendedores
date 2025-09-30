// backend/src/middlewares/validationMiddleware.js
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateVentaDiaria = [
    body('fecha').isDate().withMessage('Fecha debe ser válida'),
    body('montoVentaMillones').isFloat({ min: 0 }).withMessage('Monto debe ser un número positivo'),
    body('asistencia').isBoolean().withMessage('Asistencia debe ser true o false'),
    handleValidationErrors
];

export const validateEvaluacionMensual = [
    body('mes').isInt({ min: 1, max: 12 }).withMessage('Mes debe ser entre 1 y 12'),
    body('anio').isInt({ min: 2020 }).withMessage('Año debe ser válido'),
    body('aprendizajePuntuacion').isInt({ min: 1, max: 5 }).withMessage('Puntuación aprendizaje debe ser 1-5'),
    body('vestimentaAreaPuntuacion').isInt({ min: 1, max: 5 }).withMessage('Puntuación vestimenta debe ser 1-5'),
    handleValidationErrors
];