// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js"; // ✅ Usar import en lugar de require
import './src/models/associations.js'; // 👈 IMPORTA LAS ASOCIACIONES AQUÍ

// Middlewares de seguridad
import { securityHeaders, generalLimiter, authLimiter } from "./src/middlewares/security.js";

// Rutas
import authRoutes from "./src/routes/authRoutes.js";
import kpiRoutes from "./src/routes/kpiRoutes.js";

dotenv.config();

const app = express();

// Middlewares de seguridad
app.use(securityHeaders);
app.use(generalLimiter);

// Middlewares generales
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ API KPI funcionando correctamente");
});

// Rutas API
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/kpi", kpiRoutes);

const PORT = process.env.PORT || 5000;

// Conexión DB y servidor
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conectado a PostgreSQL con Sequelize");
    return sequelize.sync({ force: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT} → http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error("❌ Error conectando a la DB:", error);
  });