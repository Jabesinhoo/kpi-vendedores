// backend/src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        // Buscar usuario
        const usuarioEncontrado = await Usuario.findOne({ where: { usuario } });
        if (!usuarioEncontrado) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuarioEncontrado.password);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { 
                id: usuarioEncontrado.id, 
                usuario: usuarioEncontrado.usuario, 
                rol: usuarioEncontrado.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: usuarioEncontrado.id,
                nombre: usuarioEncontrado.nombre,
                usuario: usuarioEncontrado.usuario,
                rol: usuarioEncontrado.rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
};