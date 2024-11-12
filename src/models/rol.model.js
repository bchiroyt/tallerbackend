import { db } from '../database/database.js';


//obtener todos los roles
const getAll = async () => {
  const query = `SELECT * FROM taller.roles`;
  const { rows } = await db.query(query);
  return rows;
};

// Crear un nuevo rol
const create = async ({ nombre, descripcion }) => {
  const query = {
    text: `INSERT INTO taller.roles (nombre, descripcion) VALUES ($1, $2) RETURNING *`,
    values: [nombre, descripcion]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar un rol
const deleteById = async (id_rol) => {
  const query = {
    text: `DELETE FROM taller.roles WHERE id_rol = $1`,
    values: [id_rol]
  };
  const result = await db.query(query);
  return result.rowCount > 0;
};

export const RolModel = {
  getAll,
  create,  
  deleteById
};