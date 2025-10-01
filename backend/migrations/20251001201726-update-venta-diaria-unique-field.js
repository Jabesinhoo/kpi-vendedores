// migrations/20251001-fix-unique-kpi-ventas-diarias.js
export async function up(queryInterface, Sequelize) {
  // 1) Borrar la constraint única SOLO en fecha (si existe)
  // El nombre sale del error: kpi_ventas_diarias_fecha_key
  try {
    await queryInterface.removeConstraint('kpi_ventas_diarias', 'kpi_ventas_diarias_fecha_key');
  } catch (e) {
    console.warn('Constraint kpi_ventas_diarias_fecha_key no existía o ya fue eliminada');
  }

  // 2) Crear la constraint única compuesta (vendedorId, fecha)
  await queryInterface.addConstraint('kpi_ventas_diarias', {
    fields: ['vendedorId', 'fecha'],
    type: 'unique',
    name: 'kpi_ventas_diarias_vendedor_fecha_key'
  });
}

export async function down(queryInterface, Sequelize) {
  // revertir: quitar compuesta y volver a la de fecha (no recomendado, pero por simetría)
  try {
    await queryInterface.removeConstraint('kpi_ventas_diarias', 'kpi_ventas_diarias_vendedor_fecha_key');
  } catch (e) {}
  await queryInterface.addConstraint('kpi_ventas_diarias', {
    fields: ['fecha'],
    type: 'unique',
    name: 'kpi_ventas_diarias_fecha_key'
  });
}
