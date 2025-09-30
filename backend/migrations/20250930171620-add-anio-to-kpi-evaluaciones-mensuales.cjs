'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('kpi_evaluaciones_mensuales', 'anio', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('kpi_evaluaciones_mensuales', 'anio');
  }
};
