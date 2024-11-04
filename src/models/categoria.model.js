import { db } from '../database/database.js';

// Crear una nueva categoría 
const create = async({ nombre_categoria, descripcion }) => {
  const query = {
    text: `
    INSERT INTO taller.categorias (nombre_categoria, descripcion, estado_cat) 
    VALUES ($1, $2, TRUE)
    RETURNING id_categoria, nombre_categoria, descripcion, estado_cat
    `,
    values: [nombre_categoria, descripcion]
  };
  const { rows } = await db.query(query);
  return rows[0];
}; 

// Actualizar una categoría por ID
const updateById = async (id, { nombre_categoria, descripcion, estado_cat }) => {
  const query = {
    text: `
      UPDATE taller.categorias 
      SET nombre_categoria = $1, descripcion = $2, estado_cat = $3
      WHERE id_categoria = $4 
      RETURNING id_categoria, nombre_categoria, descripcion, estado_cat
    `,
    values: [nombre_categoria, descripcion, estado_cat, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Cambiar el estado de una categoría por ID (eliminación lógica)
const estadoCategoria = async (id, estado_cat) => {
  const query = {
    text: `UPDATE taller.categorias SET estado_cat = $1 WHERE id_categoria = $2`,
    values: [estado_cat, id]
  };
  const result = await db.query(query);
  return result.rowCount > 0;
};

// Obtener todas las categorías (incluyendo desactivadas)
const getAll = async () => {
  const query = `SELECT * FROM taller.categorias`;
  const { rows } = await db.query(query);
  return rows;
};

// Buscar una categoría por ID
const findById = async (id) => {
  const query = {
    text: `SELECT * FROM taller.categorias WHERE id_categoria = $1`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar una categoría por ID (eliminación física)
const deleteById = async (id) => {
  const query = {
    text: `DELETE FROM taller.categorias WHERE id_categoria = $1`,
    values: [id]
  };
  const result = await db.query(query);
  return result.rowCount > 0;
};

export const CategoriaModel = {
  create,
  findById,
  updateById,
  estadoCategoria,
  deleteById,
  getAll
};