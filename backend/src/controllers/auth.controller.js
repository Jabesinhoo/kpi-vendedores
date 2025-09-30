// backend/src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const register = async (req, res) => {
    try {
        const { nombre, usuario, password, rol } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ where: { usuario } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const nuevoUsuario = await Usuario.create({
            nombre,
            usuario,
            password: hashedPassword,
            rol: rol || 'registrador'
        });

        // Generar token
        const token = jwt.sign(
            { id: nuevoUsuario.id, usuario: nuevoUsuario.usuario, rol: nuevoUsuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                usuario: nuevoUsuario.usuario,
                rol: nuevoUsuario.rol
            }
        });
    } catch (error) {
        console.error('Error en register:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
};

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