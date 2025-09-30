export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("kpi_ventas_diarias", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vendedorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "vendedores",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    registradoPorUsuarioId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    fecha: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    monto: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("kpi_ventas_diarias");
}
