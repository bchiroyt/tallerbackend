import { db } from '../database/database.js';

// Crear un nuevo usuario en la base de datos
const create = async({ nombre, apellido, email, password, telefono, direccion, id_rol }) => {
  const query = {
    text: `
    INSERT INTO taller.usuarios (nombre, apellido, email, password, telefono, direccion, id_rol) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id_usuario, nombre, apellido, email, id_rol, estado_usu
    `,
    values: [nombre, apellido, email, password, telefono, direccion, id_rol]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Buscar un usuario por email
const findOneByEmail = async (email) => {
  const query = {
    text: `SELECT * FROM taller.usuarios WHERE email = $1`,
    values: [email]
  }
  const { rows } = await db.query(query)
  return rows[0]
};

// Actualizar el estado 
const updateEstado = async (id, estado_usu) => {
  const query = {
    text: `
      UPDATE taller.usuarios
      SET estado_usu = $1
      WHERE id_usuario = $2
      RETURNING id_usuario, estado_usu
    `,
    values: [estado_usu, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener todos los usuarios
const getAll = async () => {
  const query = `
    SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.direccion, u.estado_usu, r.nombre AS nombre_rol, r.descripcion
    FROM taller.usuarios u
    JOIN taller.roles r ON u.id_rol = r.id_rol
  `;
  const { rows } = await db.query(query);
  return rows;
};

// Buscar un usuario por ID
const findById = async (id) => {
  const query = {
    text: `
      SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.direccion, u.estado_usu, r.nombre AS nombre_rol, r.descripcion
      FROM taller.usuarios u
      JOIN taller.roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
    `,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un usuario por ID
const updateById = async (id, { nombre, apellido, email, password, telefono, direccion, id_rol }) => {
  const query = {
    text: `
      UPDATE taller.usuarios 
      SET nombre = $1, apellido = $2, email = $3, password = $4, telefono = $5, direccion = $6, id_rol = $7 
      WHERE id_usuario = $8 
      RETURNING id_usuario, nombre, apellido, email, id_rol, telefono, direccion, estado_usu
    `,
    values: [nombre, apellido, email, password, telefono, direccion, id_rol, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar un usuario 
const deleteById = async (id) => {
  const client = await db.connect();
  try {
    
    if (id === '1' || id === 1) {
      throw new Error('No se puede eliminar el usuario administrador principal');
    }

    
    const usuarioExiste = await client.query(
      'SELECT id_usuario FROM taller.usuarios WHERE id_usuario = $1',
      [id]
    );

    if (usuarioExiste.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const query = {
      text: `DELETE FROM taller.usuarios WHERE id_usuario = $1 RETURNING *`,
      values: [id]
    };
    const result = await client.query(query);
    return result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};



export const UserModel = {
  create,
  findOneByEmail,
  updateEstado,
  getAll,
  findById,
  updateById,
  deleteById
};

