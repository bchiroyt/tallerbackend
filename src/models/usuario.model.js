import { db } from '../database/database.js';

// Crear un nuevo usuario
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
  // Validar que no se pueda desactivar el usuario 0
  if (id === '0' || id === 0) {
    throw new Error('No se puede modificar el estado del usuario huérfano (ID 0)');
  }

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
    SELECT 
      u.id_usuario, 
      u.nombre, 
      u.apellido, 
      u.email, 
      u.telefono, 
      u.direccion, 
      u.estado_usu, 
      u.id_rol,
      r.nombre AS nombre_rol, 
      r.descripcion
    FROM taller.usuarios u
    JOIN taller.roles r ON u.id_rol = r.id_rol
  `;
  const { rows } = await db.query(query);
  return rows;
};

// Buscar un usuario 
const findById = async (id) => {
  const query = {
    text: `
      SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.password, 
             u.telefono, u.direccion, u.estado_usu, u.id_rol,
             r.nombre AS nombre_rol, r.descripcion
      FROM taller.usuarios u
      JOIN taller.roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
    `,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un usuario 
const updateById = async (id, { nombre, apellido, email, password, telefono, direccion, id_rol }) => {
  // Validar que no se pueda actualizar el usuario 0
  if (id === '0' || id === 0) {
    throw new Error('No se puede modificar el usuario huérfano (ID 0)');
  }

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
    // Validaciones iniciales
    if (id === '0' || id === 0) {
      throw new Error('No se puede eliminar el usuario huérfano (ID 0)');
    }
    if (id === '1' || id === 1) {
      throw new Error('No se puede eliminar el usuario administrador principal');
    }

    // Verificar si el usuario existe
    const usuarioExiste = await client.query(
      'SELECT id_usuario FROM taller.usuarios WHERE id_usuario = $1',
      [id]
    );

    if (usuarioExiste.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    await client.query('BEGIN');

    // Actualizar referencias en todas las tablas relacionadas
    const queries = [
      `UPDATE taller.ventas SET id_usuario = 0 WHERE id_usuario = $1`,
      `UPDATE taller.compras SET id_usuario = 0 WHERE id_usuario = $1`,
      `UPDATE taller.cajas SET id_usuario = 0 WHERE id_usuario = $1`,
      `UPDATE taller.citas_mantenimiento SET id_tecnico = 0 WHERE id_tecnico = $1`,
      `UPDATE taller.reembolsos SET id_usuario = 0 WHERE id_usuario = $1`
    ];

    // Ejecutar todas las actualizaciones
    for (const queryText of queries) {
      await client.query(queryText, [id]);
    }

    // Eliminar el usuario
    const deleteQuery = {
      text: `DELETE FROM taller.usuarios WHERE id_usuario = $1 RETURNING *`,
      values: [id]
    };
    const result = await client.query(deleteQuery);

    await client.query('COMMIT');
    return result.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
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

