import { db } from '../database/database.js';

// Crear un nuevo producto
const create = async ({ id_categoria, codigo, nombre, precio_costo, precio_venta, stock, marca, descripcion, imagen }) => {
  const query = {
    text: `
    INSERT INTO taller.productos (id_categoria, codigo, nombre, precio_costo, precio_venta, stock, marca, descripcion, imagen, estado) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
    RETURNING *
    `,
    values: [id_categoria, codigo, nombre, precio_costo, precio_venta, stock, marca, descripcion, imagen]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener todos los productos
const getAll = async (categoriaId = null, ordenId = 'asc', ordenNombre = 'asc') => {
  const query = {
    text: `
      SELECT p.*, (SELECT nombre_categoria FROM taller.categorias WHERE id_categoria = p.id_categoria) AS nombre_categoria 
      FROM taller.productos p
      ${categoriaId ? 'WHERE p.id_categoria = $1' : ''}
      ORDER BY p.id_producto ${ordenId === 'desc' ? 'DESC' : 'ASC'}, p.nombre ${ordenNombre === 'desc' ? 'DESC' : 'ASC'}
    `,
    values: categoriaId ? [categoriaId] : []
  };
  const { rows } = await db.query(query);
  return rows;
};

// Obtener un producto por ID
const findById = async (id) => {
  const query = {
    text: `
      SELECT p.*, c.nombre_categoria
      FROM taller.productos p
      LEFT JOIN taller.categorias c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = $1
    `,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un producto por ID
const updateById = async (id, { id_categoria, codigo, nombre, precio_costo, precio_venta, stock, marca, descripcion, imagen }) => {
  const query = {
    text: `
    UPDATE taller.productos 
    SET id_categoria = $1, codigo = $2, nombre = $3, precio_costo = $4, precio_venta = $5, stock = $6, marca = $7, descripcion = $8, imagen = $9 
    WHERE id_producto = $10 
    RETURNING *
    `,
    values: [id_categoria, codigo, nombre, precio_costo, precio_venta, stock, marca, descripcion, imagen, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar un producto por ID
const deleteById = async (id) => {
  const query = {
    text: `DELETE FROM taller.productos WHERE id_producto = $1`,
    values: [id]
  };
  await db.query(query);
  return true;
};

// Cambiar el estado de un producto por ID
const cambiarEstadoById = async (id, estado) => {
  const query = {
    text: `UPDATE taller.productos SET estado = $1 WHERE id_producto = $2 RETURNING *`,
    values: [estado, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// buscar por codigo o nombre
const buscar = async (termino) => {
  // Primero intentamos buscar por código exacto
  const queryByCodigo = {
    text: `
      SELECT 
        p.id_producto as id,
        p.nombre,
        p.stock,
        p.precio_costo,
        p.precio_venta
      FROM taller.productos p
      WHERE p.codigo = $1
      LIMIT 1
    `,
    values: [termino]
  };
  
  let result = await db.query(queryByCodigo);
  
  // Si no encontramos por código exacto, buscamos por nombre
  if (result.rows.length === 0) {
    const queryByNombre = {
      text: `
        SELECT 
          p.id_producto as id,
          p.nombre,
          p.stock,
          p.precio_costo,
          p.precio_venta
        FROM taller.productos p
        WHERE p.nombre ILIKE $1
        LIMIT 1
      `,
      values: [`%${termino}%`]
    };
    result = await db.query(queryByNombre);
  }
  
  return result.rows[0];
};

const updateStockAndPrices = async (id_producto, cantidad, precio_costo, precio_venta) => {
  const query = {
    text: `
      UPDATE taller.productos
      SET stock = stock + $2,
          precio_costo = $3,
          precio_venta = $4
      WHERE id_producto = $1
      RETURNING *
    `,
    values: [id_producto, cantidad, precio_costo, precio_venta]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};

export const ProductoModel = {
  create,
  getAll,
  findById,
  updateById,
  deleteById,
  cambiarEstadoById,
  buscar,
  updateStockAndPrices
};

