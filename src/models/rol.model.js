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
  try {
    // Iniciar una transacción
    await db.query('BEGIN');

    // Actualizar usuarios al rol por defecto (id_rol = 1)
    const updateUsersQuery = {
      text: `
        UPDATE taller.usuarios 
        SET id_rol = 1 
        WHERE id_rol = $1
      `,
      values: [id_rol]
    };
    await db.query(updateUsersQuery);

    // Eliminar los permisos asociados al rol
    const deletePermisosQuery = {
      text: `
        DELETE FROM taller.roles_modulos 
        WHERE id_rol = $1
      `,
      values: [id_rol]
    };
    await db.query(deletePermisosQuery);

    // Eliminar el rol
    const deleteRolQuery = {
      text: `DELETE FROM taller.roles WHERE id_rol = $1`,
      values: [id_rol]
    };
    const result = await db.query(deleteRolQuery);

    // Confirmar la transacción
    await db.query('COMMIT');
    
    return result.rowCount > 0;
  } catch (error) {
    // Si hay error, revertir los cambios
    await db.query('ROLLBACK');
    throw error;
  }
};

export const RolModel = {
  getAll,
  create,  
  deleteById
};