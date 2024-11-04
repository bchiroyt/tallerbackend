import { db } from '../database/database.js';

// Crear un nuevo cliente
const create = async({ nit, nombre, email, direccion, telefono }) => {
    const query = {
      text: `
      INSERT INTO taller.clientes (nit, nombre, email, direccion, telefono, estado_cli) 
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING id_cliente, nit, nombre, email, direccion, telefono, estado_cli
      `,
      values: [nit, nombre, email, direccion, telefono]
    };
    const { rows } = await db.query(query);
    return rows[0];
  }; 

// Actualizar un cliente por ID
const updateById = async (id, { nit, nombre, email, direccion, telefono, estado_cli }) => {
    const query = {
      text: `
        UPDATE taller.clientes 
        SET nit = $1, nombre = $2, email = $3, direccion = $4, telefono = $5, estado_cli = $6
        WHERE id_cliente = $7 
        RETURNING id_cliente, nit, nombre, email, direccion, telefono, estado_cli
      `,
      values: [nit, nombre, email, direccion, telefono, estado_cli, id]
    };
    const { rows } = await db.query(query);
    return rows[0];
  };
  

// Cambiar el estado de un cliente por ID (eliminación lógica)
const estadoCliente = async (id, estado_cli) => {
  const query = {
    text: `UPDATE taller.clientes SET estado_cli = $1 WHERE id_cliente = $2`,
    values: [estado_cli, id]
  };
  const result = await db.query(query);
  return result.rowCount > 0;
};

// Obtener todos los clientes (incluyendo desactivados)
const getAll = async () => {
  const query = `SELECT * FROM taller.clientes`;
  const { rows } = await db.query(query);
  return rows;
};

// Buscar un cliente por ID
const findById = async (id) => {
  const query = {
    text: `SELECT * FROM taller.clientes WHERE id_cliente = $1`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar un cliente por ID (eliminación física)
const deleteById = async (id) => {
  const query = {
    text: `DELETE FROM taller.clientes WHERE id_cliente = $1`,
    values: [id]
  };
  const result = await db.query(query);
  return result.rowCount > 0;
};

export const ClienteModel = {
  create,
  findById,
  updateById,
  estadoCliente,
  deleteById,
  getAll
};