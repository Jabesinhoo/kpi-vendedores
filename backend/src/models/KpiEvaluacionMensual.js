// backend/src/models/KpiEvaluacionMensual.js
import { DataTypes } from "sequelize";
import sequelize from '../../config/database.js';

const KpiEvaluacionMensual = sequelize.define("KpiEvaluacionMensual", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    mes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 12
        }
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    aprendizajePuntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        },
        field: 'aprendizaje_puntuacion'
    },
    vestimentaAreaPuntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        },
        field: 'vestimenta_area_puntuacion'
    },
    evaluadorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'evaluador_id'
    }
}, {
    tableName: "kpi_evaluaciones_mensuales",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['vendedorId', 'mes', 'anio']
        }
    ]
});

export default KpiEvaluacionMensual;