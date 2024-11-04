import { RolesModulosModel } from "../models/roles_modulos.model.js";

// Asignar un módulo a un rol
const asignarModulo = async (req, res) => {
  try {
    const { id_rol, id_modulo } = req.body;
    await RolesModulosModel.asignarModulo(id_rol, id_modulo);
    res.json({ ok: true, msg: 'Módulo asignado al rol correctamente' });
  } catch (error) {
    console.error("Error al asignar módulo:", error);
    res.status(500).json({ ok: false, msg: "Error al asignar módulo" });
  }
};

// Desasignar un módulo de un rol
const desasignarModulo = async (req, res) => {
  try {
    const { id_rol, id_modulo } = req.body;
    await RolesModulosModel.desasignarModulo(id_rol, id_modulo);
    res.json({ ok: true, msg: 'Módulo desasignado del rol correctamente' });
  } catch (error) {
    console.error("Error al desasignar módulo:", error);
    res.status(500).json({ ok: false, msg: "Error al desasignar módulo" });
  }
};

// Obtener permisos por rol
const getPermisosByRol = async (req, res) => {
  try {
    const { id_rol } = req.params;
    const permisos = await RolesModulosModel.getPermisosByRol(id_rol);
    res.json({ ok: true, permisos });
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener permisos" });
  }
};

export const RolesModulosController = {
  asignarModulo,
  desasignarModulo,
  getPermisosByRol
};