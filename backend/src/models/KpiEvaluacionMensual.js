import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KpiEvaluacionMensual = sequelize.define("KpiEvaluacionMensual", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // FK: vendedorId (se agrega automáticamente)
    
    mes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 12 }
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    
    // Puntuación de Aprendizaje (1-5)
    aprendizajePuntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'aprendizaje_puntuacion',
        validate: { min: 1, max: 5 }
    },
    // Puntuación de Vestimenta + Área de Trabajo (1-5)
    vestimentaAreaPuntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'vestimenta_area_puntuacion',
        validate: { min: 1, max: 5 }
    },
    
    // Usuario que realizó la evaluación
    evaluadorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'evaluador_id'
    }
}, {
    tableName: "kpi_evaluacion_mensual",
    timestamps: true,
    indexes: [
        // Índice único compuesto: asegura una evaluación por vendedor, mes y año
        {
            unique: true,
            fields: ['vendedorId', 'mes', 'anio']
        }
    ]
});

export default KpiEvaluacionMensual;