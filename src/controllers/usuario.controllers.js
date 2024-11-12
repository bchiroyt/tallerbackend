import { UserModel } from "../models/usuario.model.js";
import { RolesModulosModel } from "../models/roles_modulos.model.js"; 
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Regstrar un nuevo usuarios
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

    
    const usuario = await UserModel.findOneByEmail(email);
    if (!usuario) {
      return res.status(400).json({ ok: false, msg: 'Usuario o contraseña incorrectos' });
    }

    
    if (!usuario.estado_usu) {
      return res.status(403).json({ ok: false, msg: 'Usuario desactivado. Contacte al administrador.' });
    }

    
    const esPasswordCorrecta = await bcryptjs.compare(password, usuario.password);
    if (!esPasswordCorrecta) {
      return res.status(400).json({ ok: false, msg: 'Usuario o contraseña incorrectos' });
    }

    
    const permisos = await RolesModulosModel.getPermisosByRol(usuario.id_rol);

    
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
    const result = await UserModel.getAll(); 
    res.json({ ok: true, usuarios: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error del servidor al obtener los usuarios'
    });
  }
};

// obtener un usuario en especifico
const getUsuario = async (req, res) => {
  try {
    const { iduser } = req.params;
    const result = await UserModel.findById(iduser); 
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

// Cambiar el estado
const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { iduser } = req.params;
    const { estado_usu } = req.body; 

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

// Eliminar un usuario 
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
    
    const usuario = await UserModel.findOneByEmail(req.user.email); 
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    
    const token = jwt.sign({ email: usuario.email, id_rol: usuario.id_rol }, process.env.JWT_SECRET, { expiresIn: '10h' });

   
    const response = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      id_rol: usuario.id_rol,
      token 
    };

    return res.json({ ok: true, usuario: response }); 
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
