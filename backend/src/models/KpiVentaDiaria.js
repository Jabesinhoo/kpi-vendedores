import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KpiVentaDiaria = sequelize.define("KpiVentaDiaria", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // La FK (clave foránea) se añade automáticamente por Sequelize como 'vendedorId'
    // Se recomienda establecer la relación en el archivo de asociaciones
    
    fecha: {
        type: DataTypes.DATEONLY, // Solo la fecha (sin hora)
        allowNull: false,
        unique: 'unique_vendedor_fecha' // Usado para crear la restricción UNIQUE compuesta
    },
    // Monto de la venta diaria en millones (Ej: 5.35)
    montoVentaMillones: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
        field: 'monto_venta_millones'
    },
    // Asistencia (TRUE=vino, FALSE=falta)
    asistencia: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    // Campo para saber qué usuario hizo el registro/edición
    registradoPorUsuarioId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'registrado_por_usuario_id'
    }
}, {
    tableName: "kpi_ventas_diarias",
    timestamps: true,
    indexes: [
        // Índice único compuesto: asegura que solo hay una entrada por vendedor por día
        {
            unique: true,
            fields: ['vendedorId', 'fecha'] // Sequelize espera camelCase para las FKs
        }
    ]
});

export default KpiVentaDiaria;