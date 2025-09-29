export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("usuarios", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    rol: {
      type: Sequelize.ENUM("admin", "registrador"),
      defaultValue: "registrador",
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("usuarios");
}
