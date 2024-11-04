import { UserModel } from "../models/usuario.model.js";
import { RolesModulosModel } from "../models/roles_modulos.model.js"; 
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Registrar un nuevo usuarios
const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, direccion, id_rol } = req.body;

    
    const usuarioExistente = await UserModel.findOneByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ ok: false, msg: 'El usuario ya existe' });
    }

    
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const nuevoUsuario = await UserModel.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      telefono,
      direccion,
      id_rol
    });

    return res.status(201).json({ ok: true, msg: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al registrar el usuario' });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const usuario = await UserModel.findOneByEmail(email);
    if (!usuario) {
      return res.status(400).json({ ok: false, msg: 'Usuario o contraseña incorrectos' });
    }

    // Verificar el estado del usuario
    if (!usuario.estado_usu) {
      return res.status(403).json({ ok: false, msg: 'Usuario desactivado. Contacte al administrador.' });
    }

    // Verificar la contraseña
    const esPasswordCorrecta = await bcryptjs.compare(password, usuario.password);
    if (!esPasswordCorrecta) {
      return res.status(400).json({ ok: false, msg: 'Usuario o contraseña incorrectos' });
    }

    // Obtener permisos del usuario
    const permisos = await RolesModulosModel.getPermisosByRol(usuario.id_rol);

    // Generar el token JWT
    const token = jwt.sign({ email: usuario.email, id_rol: usuario.id_rol, permisos }, process.env.JWT_SECRET, { expiresIn: '10h' });

    return res.json({ ok: true, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al iniciar sesión' });
  }
};


// Mostrar todos los Usuarios
const getAllUsuarios = async (req, res) => {
  try {
    const result = await UserModel.getAll();  // Se utiliza el modelo de usuario para obtener todos los usuarios
    res.json({ ok: true, usuarios: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error del servidor al obtener los usuarios'
    });
  }
};

// Obtener un usuario en específico
const getUsuario = async (req, res) => {
  try {
    const { iduser } = req.params;
    const result = await UserModel.findById(iduser);  // Modelo para encontrar usuario por ID
    if (!result) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }
    res.json({ ok: true, usuario: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error del servidor al obtener el usuario'
    });
  }
};

// Actualizar Usuarios
const actualizarUsuario = async (req, res) => {
  try {
    const { iduser } = req.params;
    const { nombre, apellido, email, password, telefono, direccion, id_rol } = req.body;
    
    // Hash de la contraseña en caso de que se actualice
    let hashedPassword = password;
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashedPassword = await bcryptjs.hash(password, salt);
    }

    const result = await UserModel.updateById(iduser, {
      nombre,
      apellido,
      email,
      password: hashedPassword,
      telefono,
      direccion,
      id_rol
    });

    if (!result) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado"
      });
    }

    res.json({
      ok: true,
      msg: 'Usuario actualizado exitosamente',
      usuario: result
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error del servidor al actualizar el usuario'
    });
  }
};

// Cambiar el estado de un usuario (eliminación lógica)
const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { iduser } = req.params;
    const { estado_usu } = req.body; // true o false

    const result = await UserModel.updateEstado(iduser, estado_usu);
    if (!result) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado"
      });
    }

    res.json({
      ok: true,
      msg: 'Estado del usuario actualizado exitosamente'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error del servidor al actualizar el estado del usuario'
    });
  }
};

// Eliminar un usuario por ID (eliminación física)
const eliminarUsuario = async (req, res) => {
  try {
    const { iduser } = req.params;

    const result = await UserModel.deleteById(iduser);
    if (!result) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado"
      });
    }

    res.json({
      ok: true,
      msg: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error del servidor al eliminar el usuario'
    });
  }
};


const profile = async (req, res) => {
  try {
    // Obtener el usuario actual usando el email del token
    const usuario = await UserModel.findOneByEmail(req.user.email); // Cambiado para usar req.user.email
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    // Generar un nuevo token JWT
    const token = jwt.sign({ email: usuario.email, id_rol: usuario.id_rol }, process.env.JWT_SECRET, { expiresIn: '10h' });

    // Devolver solo los campos requeridos
    const response = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      id_rol: usuario.id_rol,
      token // Incluir el token en la respuesta
    };

    return res.json({ ok: true, usuario: response }); // Devolver el usuario con los campos específicos
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error del servidor'
    });
  }
};

export const UserController = {
  register,
  login,
  getAllUsuarios,
  getUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  profile
};
