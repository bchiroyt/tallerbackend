import { db } from '../database/database.js';

// Asignar un módulo a un rol
const asignarModulo = async (id_rol, id_modulo) => {
  const query = {
    text: `INSERT INTO taller.roles_modulos (id_rol, id_modulo) VALUES ($1, $2)`,
    values: [id_rol, id_modulo]
  };
  await db.query(query);
};

// Desasignar un módulo de un rol
const desasignarModulo = async (id_rol, id_modulo) => {
  const query = {
    text: `DELETE FROM taller.roles_modulos WHERE id_rol = $1 AND id_modulo = $2`,
    values: [id_rol, id_modulo]
  };
  await db.query(query);
};

// Obtener permisos por rol
const getPermisosByRol = async (id_rol) => {
  const query = {
    text: `SELECT id_modulo FROM taller.roles_modulos WHERE id_rol = $1`,
    values: [id_rol]
  };
  const { rows } = await db.query(query);
  return rows;
};

export const RolesModulosModel = {
  asignarModulo,
  desasignarModulo,
  getPermisosByRol  
};