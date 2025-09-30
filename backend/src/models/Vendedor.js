// backend/src/models/Vendedor.js
import { DataTypes } from "sequelize";
import sequelize from '../../config/database.js';

const Vendedor = sequelize.define("Vendedor", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    // TRUE: Vendedor activo. FALSE: Histórico (ya no se le registran KPIs).
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    fechaIngreso: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'fecha_ingreso'
    }
}, {
    tableName: "vendedores",
    timestamps: true,
});

export default Vendedor;