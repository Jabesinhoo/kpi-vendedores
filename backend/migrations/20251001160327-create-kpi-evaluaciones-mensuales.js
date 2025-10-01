export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("kpi_evaluaciones_mensuales", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      mes: { type: Sequelize.INTEGER, allowNull: false },
      anio: { type: Sequelize.INTEGER, allowNull: false },
      vendedorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "vendedores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("kpi_evaluaciones_mensuales");
  },
};
