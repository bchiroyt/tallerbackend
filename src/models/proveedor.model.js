import { db } from '../database/database.js';

// Crear un nuevo proveedor
const create = async ({ nombre_compañia, persona_contacto, direccion, telefono }) => {
  const query = {
    text: `
      INSERT INTO taller.proveedores (nombre_compañia, persona_contacto, direccion, telefono, estado_prov) 
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id_proveedor, nombre_compañia, persona_contacto, direccion, telefono, estado_prov
    `,
    values: [nombre_compañia, persona_contacto, direccion, telefono]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener todos los proveedores
const getAll = async () => {
  const query = `SELECT * FROM taller.proveedores`;
  const { rows } = await db.query(query);
  return rows;
};

// Buscar un proveedor 
const findById = async (id) => {
  const query = {
    text: `SELECT * FROM taller.proveedores WHERE id_proveedor = $1`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un proveedor 
const updateById = async (id, { nombre_compañia, persona_contacto, direccion, telefono, estado_prov }) => {
  const query = {
    text: `
      UPDATE taller.proveedores 
      SET nombre_compañia = $1, persona_contacto = $2, direccion = $3, telefono = $4, estado_prov = $5
      WHERE id_proveedor = $6 
      RETURNING id_proveedor, nombre_compañia, persona_contacto, direccion, telefono, estado_prov
    `,
    values: [nombre_compañia, persona_contacto, direccion, telefono, estado_prov, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Cambiar el estado de un proveedor 
const estadoProveedor = async (id, estado_prov) => {
  const query = {
    text: `UPDATE taller.proveedores SET estado_prov = $1 WHERE id_proveedor = $2`,
    values: [estado_prov, id]
  };
  const result = await db.query(query);
  return result.rowCount > 0;
};

// Eliminar
const deleteById = async (id) => {
  const query = {
    text: `DELETE FROM taller.proveedores WHERE id_proveedor = $1`,
    values: [id]
  };
  const result = await db.query(query);
  return result.rowCount > 0;
};

export const ProveedorModel = {
  create,
  getAll,
  findById,
  updateById,
  estadoProveedor,
  deleteById
};