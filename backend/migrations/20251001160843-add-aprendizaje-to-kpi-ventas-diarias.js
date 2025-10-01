export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("kpi_ventas_diarias", "aprendizaje_puntuacion", {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("kpi_ventas_diarias", "aprendizaje_puntuacion");
}
