export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('kpi_ventas_diarias', 'asistencia', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('kpi_ventas_diarias', 'asistencia');
}
