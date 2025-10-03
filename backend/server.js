import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import './src/models/associations.js';

// Middlewares de seguridad
import { securityHeaders, generalLimiter, authLimiter } from "./src/middlewares/security.js";

// Rutas
import authRoutes from "./src/routes/authRoutes.js";
import kpiRoutes from "./src/routes/kpiRoutes.js";

dotenv.config();

const app = express();

// ✅ Detrás de ngrok (proxy): evita problemas con express-rate-limit
app.set('trust proxy', 1);

// 🌐 CORS flexible: localhost y cualquier dominio de ngrok
const allowedOrigins = [
  /^http:\/\/localhost:(5173|3000)$/,      // desarrollo local
  /^https:\/\/.*\.ngrok-free\.(dev|app)$/, // pruebas con ngrok
  /^https:\/\/kpi\.tecnonacho\.com$/       // dominio real en producción
];


const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Postman o CLI
    if (allowedOrigins.some((re) => re.test(origin))) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight con mismas reglas

// Middlewares de seguridad
app.use(securityHeaders);
app.use(generalLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ API KPI funcionando correctamente",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check para producción
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    database: "Connected",
    timestamp: new Date().toISOString()
  });
});

// Rutas API
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/kpi", kpiRoutes);

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Ruta no encontrada",
    path: req.originalUrl 
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error("Error del servidor:", error);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message 
  });
});

const PORT = process.env.PORT || 5000;

// Función mejorada para iniciar el servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a PostgreSQL con Sequelize");
    
    await sequelize.sync({ 
      force: false,
      alter: process.env.NODE_ENV === 'development' // Solo en desarrollo
    });
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error);
    process.exit(1);
  }
};

// Manejo graceful de shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recibido SIGTERM, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recibido SIGINT, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

startServer();
