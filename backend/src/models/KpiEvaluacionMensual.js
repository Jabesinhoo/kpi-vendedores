// backend/src/models/KpiEvaluacionMensual.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const KpiEvaluacionMensual = sequelize.define("KpiEvaluacionMensual", {
  id: {
    type: DataTypes.UUID,               // ✅ ahora también UUID
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 12 },
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  aprendizajePuntuacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
    field: "aprendizaje_puntuacion",
  },
  vestimentaAreaPuntuacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
    field: "vestimenta_area_puntuacion",
  },

  // ✅ evaluador es UUID
  evaluadorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: "evaluador_id",
    references: {
      model: "usuarios", // nombre real de la tabla
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "NO ACTION",
  },

  // ✅ vendedor también UUID
  vendedorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: "vendedor_id",
    references: {
      model: "vendedores",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
}, {
  tableName: "kpi_evaluaciones_mensuales",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["vendedor_id", "mes", "anio"],
    },
  ],
});

export default KpiEvaluacionMensual;
