export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("kpi_evaluaciones_mensuales", {
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
    evaluadorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    mes: {
      type: Sequelize.STRING(7), // formato YYYY-MM
      allowNull: false,
    },
    puntaje: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    comentarios: {
      type: Sequelize.TEXT,
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
  await queryInterface.dropTable("kpi_evaluaciones_mensuales");
}
