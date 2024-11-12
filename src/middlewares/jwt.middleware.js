import jwt from 'jsonwebtoken';
import { UserModel } from '../models/usuario.model.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    token = token.split(" ")[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const usuario = await UserModel.findOneByEmail(decoded.email);
    
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }


    req.user = { 
      email: decoded.email, 
      rol: decoded.id_rol,
      permisos: decoded.permisos
    };

    req.usuario = {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      id_rol: usuario.id_rol
    };

    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Token inválido" });
  }
};

export const verifyPermission = (requiredPermission) => {
  return (req, res, next) => {
    const { permisos } = req.user;

    if (permisos.some(permiso => permiso.id_modulo === requiredPermission)) {
      return next();
    }

    return res.status(403).json({ error: "No tienes permiso para acceder a este recurso" });
  };
};
