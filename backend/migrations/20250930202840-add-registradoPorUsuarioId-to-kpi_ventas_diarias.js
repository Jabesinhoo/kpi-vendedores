export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('kpi_ventas_diarias', 'registrado_por_usuario_id', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('kpi_ventas_diarias', 'registrado_por_usuario_id');
}
