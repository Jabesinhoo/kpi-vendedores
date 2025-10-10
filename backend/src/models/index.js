// backend/src/models/index.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración DB
const env = process.env.NODE_ENV || "development";
const config = (await import(`../../config/config.json`, { assert: { type: "json" } }))
  .default[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Importar modelos manualmente (ESM)
import Usuario from "./Usuario.js";
import Vendedor from "./Vendedor.js";
import KpiVentaDiaria from "./KpiVentaDiaria.js";
import KpiEvaluacionMensual from "./KpiEvaluacionMensual.js";

// Inicializar modelos
const db = {};
db.Usuario = Usuario;
db.Vendedor = Vendedor;
db.KpiVentaDiaria = KpiVentaDiaria;
db.KpiEvaluacionMensual = KpiEvaluacionMensual;

// Asociaciones
// 🧩 Relación Usuario -> KpiVentaDiaria
db.Usuario.hasMany(db.KpiVentaDiaria, { foreignKey: "registradoPorUsuarioId" });
db.KpiVentaDiaria.belongsTo(db.Usuario, { foreignKey: "registradoPorUsuarioId" });

// 🧩 Relación Usuario -> KpiEvaluacionMensual (como evaluador)
db.Usuario.hasMany(db.KpiEvaluacionMensual, { foreignKey: "evaluadorId" });
db.KpiEvaluacionMensual.belongsTo(db.Usuario, { foreignKey: "evaluadorId" });

// 🧩 Relación Vendedor -> KPI Venta Diaria
db.Vendedor.hasMany(db.KpiVentaDiaria, { foreignKey: "vendedorId" });
db.KpiVentaDiaria.belongsTo(db.Vendedor, { foreignKey: "vendedorId" });

// 🧩 Relación Vendedor -> KPI Evaluación Mensual
db.Vendedor.hasMany(db.KpiEvaluacionMensual, { foreignKey: "vendedorId" });
db.KpiEvaluacionMensual.belongsTo(db.Vendedor, { foreignKey: "vendedorId" });

// Exportar conexión
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
