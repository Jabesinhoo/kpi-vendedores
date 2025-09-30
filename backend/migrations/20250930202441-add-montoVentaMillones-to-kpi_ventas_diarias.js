export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('kpi_ventas_diarias', 'monto_venta_millones', {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('kpi_ventas_diarias', 'monto_venta_millones');
}
