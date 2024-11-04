import { db } from '../database/database.js';

// Crear una nueva bicicleta
const create = async ({ id_categoria, codigo, nombre, marca, modelo, precio_costo, precio_venta, stock, descripcion, imagen, tipo_bicicleta }) => {
  const query = {
    text: `
    INSERT INTO taller.bicicletas (id_categoria, codigo, nombre, marca, modelo, precio_costo, precio_venta, stock, descripcion, imagen, tipo_bicicleta, estado) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
    RETURNING *
    `,
    values: [id_categoria, codigo, nombre, marca, modelo, precio_costo, precio_venta, stock, descripcion, imagen, tipo_bicicleta]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener todas las bicicletas
const getAll = async (categoriaId = null, busqueda = '', ordenId = 'asc', ordenNombre = 'asc') => {
  const query = {
    text: `
      SELECT b.*, (SELECT nombre_categoria FROM taller.categorias WHERE id_categoria = b.id_categoria) AS nombre_categoria 
      FROM taller.bicicletas b
      ${categoriaId ? 'WHERE b.id_categoria = $1' : ''}
      ${busqueda ? 'AND (b.nombre ILIKE $2 OR b.codigo ILIKE $2)' : ''}
      ORDER BY b.id_bicicleta ${ordenId === 'desc' ? 'DESC' : 'ASC'}, b.nombre ${ordenNombre === 'desc' ? 'DESC' : 'ASC'}
    `,
    values: categoriaId ? [categoriaId, `%${busqueda}%`] : busqueda ? [`%${busqueda}%`] : []
  };
  const { rows } = await db.query(query);
  return rows;
};

// Obtener una bicicleta por ID
const findById = async (id) => {
  const query = {
    text: `
      SELECT b.*, c.nombre_categoria
      FROM taller.bicicletas b
      LEFT JOIN taller.categorias c ON b.id_categoria = c.id_categoria
      WHERE b.id_bicicleta = $1
    `,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar una bicicleta por ID
const updateById = async (id, { id_categoria, codigo, nombre, marca, modelo, precio_costo, precio_venta, stock, descripcion, imagen, tipo_bicicleta }) => {
  const query = {
    text: `
    UPDATE taller.bicicletas 
    SET id_categoria = $1, codigo = $2, nombre = $3, marca = $4, modelo = $5, precio_costo = $6, precio_venta = $7, stock = $8, descripcion = $9, imagen = $10, tipo_bicicleta = $11 
    WHERE id_bicicleta = $12 
    RETURNING *
    `,
    values: [id_categoria, codigo, nombre, marca, modelo, precio_costo, precio_venta, stock, descripcion, imagen, tipo_bicicleta, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar una bicicleta por ID
const deleteById = async (id) => {
  const query = {
    text: `DELETE FROM taller.bicicletas WHERE id_bicicleta = $1`,
    values: [id]
  };
  await db.query(query);
  return true;
};

// Cambiar el estado de una bicicleta por ID
const cambiarEstadoById = async (id, estado) => {
  const query = {
    text: `UPDATE taller.bicicletas SET estado = $1 WHERE id_bicicleta = $2 RETURNING *`,
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
        b.id_bicicleta as id,
        b.nombre,
        b.stock,
        b.precio_costo,
        b.precio_venta
      FROM taller.bicicletas b
      WHERE b.codigo = $1
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
          b.id_bicicleta as id,
          b.nombre,
          b.stock,
          b.precio_costo,
          b.precio_venta
        FROM taller.bicicletas b
        WHERE b.nombre ILIKE $1
        LIMIT 1
      `,
      values: [`%${termino}%`]
    };
    result = await db.query(queryByNombre);
  }
  
  return result.rows[0];
};


const updateStockAndPrices = async (id_bicicleta, cantidad, precio_costo, precio_venta) => {
  const query = {
    text: `
      UPDATE taller.bicicletas
      SET stock = stock + $2,
          precio_costo = $3,
          precio_venta = $4
      WHERE id_bicicleta = $1
      RETURNING *
    `,
    values: [id_bicicleta, cantidad, precio_costo, precio_venta]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};


export const BicicletaModel = {
  create,
  getAll,
  findById,
  updateById,
  deleteById,
  cambiarEstadoById,
  buscar,
  updateStockAndPrices
};