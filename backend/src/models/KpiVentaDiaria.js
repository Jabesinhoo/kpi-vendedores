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
        unique: 'unique_vendedor_fecha'
    },
    montoVentaMillones: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
        field: 'monto_venta_millones'
    },
    asistencia: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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