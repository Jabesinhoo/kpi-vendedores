export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('kpi_ventas_diarias', 'registrado_por_usuario_id', {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn('kpi_ventas_diarias', 'registrado_por_usuario_id', {
    type: Sequelize.INTEGER,
    allowNull: true
  });
}
