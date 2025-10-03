// backend/src/models/KpiVentaDiaria.js
import { DataTypes } from "sequelize";
import sequelize from '../../config/database.js';

const KpiVentaDiaria = sequelize.define("KpiVentaDiaria", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    get() {
        const rawValue = this.getDataValue('fecha');
        if (!rawValue) return rawValue;
        
        if (typeof rawValue === 'string') return rawValue;
        
        const date = new Date(rawValue);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
},
  montoVenta: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    allowNull: false,
    field: 'monto_venta'
  },
  asistencia: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  aprendizajePuntuacion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 5 },
    field: 'aprendizaje_puntuacion'
  },
  vestimentaPuntuacion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 5 },
    field: 'vestimenta_puntuacion'
  },
  areaPuntuacion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 5 },
    field: 'area_puntuacion'
  },
  registradoPorUsuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'registrado_por_usuario_id'
  },

  // (opcional pero recomendado) declarar la FK si no la crea el association:
  vendedorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'vendedorId'
    // references: { model: 'vendedores', key: 'uuid_id' } // ajusta si tienes tabla/clave
  }
}, {
  tableName: "kpi_ventas_diarias",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['vendedorId', 'fecha'] // ✅ unicidad compuesta correcta
    }
  ]
});

export default KpiVentaDiaria;
