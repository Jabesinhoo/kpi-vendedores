'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 🔹 Quitar constraint vieja si existe
    await queryInterface.removeConstraint(
      'kpi_ventas_diarias',
      'kpi_ventas_diarias_registrado_por_usuario_id_fkey'
    ).catch(() => {});

    // 🔹 Cambiar tipo de columna a UUID
    await queryInterface.changeColumn('kpi_ventas_diarias', 'registrado_por_usuario_id', {
      type: Sequelize.UUID,
      allowNull: true
    });

    // 🔹 Volver a agregar la constraint
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'kpi_ventas_diarias',
      'kpi_ventas_diarias_registrado_por_usuario_id_fkey'
    ).catch(() => {});
    await queryInterface.changeColumn('kpi_ventas_diarias', 'registrado_por_usuario_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
