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
        unique: 'unique_vendedor_fecha'
    },
    // Cambiar de montoVentaMillones a montoVenta para manejar pesos completos
    montoVenta: {
        type: DataTypes.DECIMAL(15, 2), // Para manejar montos grandes en pesos colombianos
        defaultValue: 0.00,
        allowNull: false,
        field: 'monto_venta'
    },
    asistencia: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    // Agregar campos de conducta diaria
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
    }
}, {
    tableName: "kpi_ventas_diarias",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['vendedorId', 'fecha']
        }
    ]
});

export default KpiVentaDiaria;