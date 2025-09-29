import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";

// Rutas
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba (root)
app.get("/", (req, res) => {
  res.send("🚀 API KPI funcionando correctamente");
});

// Rutas API
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

// Conexión DB y servidor
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conectado a PostgreSQL con Sequelize");
    return sequelize.sync(); // ⚠️ en desarrollo usa sync, en producción se recomienda migraciones
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT} → http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error("❌ Error conectando a la DB:", error);
  });
