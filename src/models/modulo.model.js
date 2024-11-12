import { db } from '../database/database.js';

// Obtener todos los modulos
const getAll = async () => {
  const query = `SELECT * FROM taller.modulos`;
  const { rows } = await db.query(query);
  return rows;
};

// Crear un nuevo modulo
const create = async ({ nombre }) => {
  const query = {
    text: `INSERT INTO taller.modulos (nombre) VALUES ($1) RETURNING *`,
    values: [nombre]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar un modulo 
const deleteById = async (id_modulo) => {
  const query = {
    text: `DELETE FROM taller.modulos WHERE id_modulo = $1`,
    values: [id_modulo]
  };
  const result = await db.query(query);
  return result.rowCount > 0;
};

export const ModuloModel = {
  getAll,
  create,
  deleteById
};