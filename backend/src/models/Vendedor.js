import { DataTypes } from "sequelize";
import sequelize from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Vendedor = sequelize.define("Vendedor", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    }
}, {
    tableName: "vendedores",
    timestamps: true,
});

export default Vendedor;