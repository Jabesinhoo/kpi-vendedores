'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('kpi_ventas_diarias', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    monto_venta: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    asistencia: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    aprendizaje_puntuacion: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    vestimenta_puntuacion: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    area_puntuacion: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    registrado_por_usuario_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    vendedorId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'vendedores',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  // 🔹 índice único (vendedorId + fecha)
  await queryInterface.addIndex('kpi_ventas_diarias', ['vendedorId', 'fecha'], {
    unique: true,
    name: 'unique_vendedor_fecha',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('kpi_ventas_diarias');
}
