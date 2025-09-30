import bcrypt from "bcrypt";

export async function up(queryInterface, Sequelize) {
  const hash = await bcrypt.hash("admin123", 10);

  await queryInterface.bulkInsert("usuarios", [
    {
      nombre: "Administrador",   // 👈 aquí agregamos nombre
      usuario: "admin",
      password: hash,
      rol: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("usuarios", { usuario: "admin" });
}
