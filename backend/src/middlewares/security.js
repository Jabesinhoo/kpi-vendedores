// backend/src/middlewares/security.js
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";

// Rate Limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos por ventana
  message: {
    error: "Demasiados intentos de acceso, intenta más tarde",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite general de requests
  message: {
    error: "Demasiadas solicitudes, intenta más tarde",
  },
});

// Helmet para headers de seguridad
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Validación de datos
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validaciones específicas para auth
export const registerValidation = [
  body("nombre").notEmpty().withMessage("Nombre es requerido"),
  body("usuario").isLength({ min: 3 }).withMessage("Usuario debe tener al menos 3 caracteres"),
  body("password").isLength({ min: 6 }).withMessage("Contraseña debe tener al menos 6 caracteres"),
];

export const loginValidation = [
  body("usuario").notEmpty().withMessage("Usuario es requerido"),
  body("password").notEmpty().withMessage("Contraseña es requerida"),
];