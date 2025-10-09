import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export async function up(queryInterface, Sequelize) {
  const hash = await bcrypt.hash("admin123", 10);

  await queryInterface.bulkInsert("usuarios", [
    {
      id: uuidv4(), // ✅ generar UUID manualmente
      nombre: "Administrador",
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
