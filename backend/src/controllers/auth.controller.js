import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

// Registrar usuario
export async function register(req, res) {
  try {
    const { nombre, usuario, password } = req.body; // Remover rol del body

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      usuario,
      password: hash,
      rol: "registrador", // Siempre por defecto
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el registro", detalle: error.message });
  }
}

// Login usuario
export async function login(req, res) {
  try {
    const { usuario, password } = req.body;

    const user = await Usuario.findOne({ where: { usuario } });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ error: "Error en el login", detalle: error.message });
  }
}
