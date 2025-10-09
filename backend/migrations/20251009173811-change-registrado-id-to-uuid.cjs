export async function up(queryInterface, Sequelize) {
  // 🔹 Primero eliminar la constraint vieja (si existe)
  await queryInterface.removeConstraint(
    'kpi_ventas_diarias',
    'kpi_ventas_diarias_registrado_por_usuario_id_fkey'
  ).catch(() => {});

  // 🔹 Luego, cambia el tipo de columna a UUID
  await queryInterface.changeColumn('kpi_ventas_diarias', 'registrado_por_usuario_id', {
    type: Sequelize.UUID,
    allowNull: true
  });

  // 🔹 Finalmente, agrega la nueva relación FK correcta
  await queryInterface.addConstraint('kpi_ventas_diarias', {
    fields: ['registrado_por_usuario_id'],
    type: 'foreign key',
    name: 'kpi_ventas_diarias_registrado_por_usuario_id_fkey',
    references: {
      table: 'usuarios',
      field: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeConstraint(
    'kpi_ventas_diarias',
    'kpi_ventas_diarias_registrado_por_usuario_id_fkey'
  ).catch(() => {});
  await queryInterface.changeColumn('kpi_ventas_diarias', 'registrado_por_usuario_id', {
    type: Sequelize.INTEGER,
    allowNull: true
  });
}
