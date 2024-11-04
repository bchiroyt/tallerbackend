import { db } from '../database/database.js';

// Crear un nuevo accesorio
const create = async ({ id_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock, imagen }) => {
  const query = {
    text: `
    INSERT INTO taller.accesorios (id_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock, imagen, estado_acce) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
    RETURNING id_accesorio, (SELECT nombre_categoria FROM taller.categorias WHERE id_categoria = $1) AS nombre_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock, imagen, estado_acce
    `,
    values: [id_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock, imagen]
  };
  const { rows } = await db.query(query);
  return rows[0];
};


// Obtener todos los accesorios
const getAll = async (categoriaId = null, busqueda = '', ordenId = 'asc', ordenNombre = 'asc') => {
  const query = {
    text: `
      SELECT a.*, (SELECT nombre_categoria FROM taller.categorias WHERE id_categoria = a.id_categoria) AS nombre_categoria 
      FROM taller.accesorios a
      ${categoriaId ? 'WHERE a.id_categoria = $1' : ''}
      ${busqueda ? 'AND (a.nombre ILIKE $2 OR a.codigo_barra ILIKE $2)' : ''}
      ORDER BY a.id_accesorio ${ordenId === 'desc' ? 'DESC' : 'ASC'}, a.nombre ${ordenNombre === 'desc' ? 'DESC' : 'ASC'}
    `,
    values: categoriaId ? [categoriaId, `%${busqueda}%`] : busqueda ? [`%${busqueda}%`] : []
  };
  const { rows } = await db.query(query);
  return rows;
};

// Obtener un accesorio por ID
const findById = async (id) => {
  const query = {
    text: `
      SELECT a.*, c.nombre_categoria
      FROM taller.accesorios a
      LEFT JOIN taller.categorias c ON a.id_categoria = c.id_categoria
      WHERE a.id_accesorio = $1
    `,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un accesorio por ID
const updateById = async (id, { id_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock, imagen }) => {
  const query = {
    text: `
    UPDATE taller.accesorios 
    SET id_categoria = $1, codigo_barra = $2, nombre = $3, material = $4, precio_costo = $5, precio_venta = $6, stock = $7, imagen = $8 
    WHERE id_accesorio = $9 
    RETURNING *
    `,
    values: [id_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock, imagen, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar un accesorio por ID
const deleteById = async (id) => {
  const query = {
    text: `DELETE FROM taller.accesorios WHERE id_accesorio = $1`,
    values: [id]
  };
  await db.query(query);
  return true;
};

// Cambiar el estado de un accesorio por ID
const cambiarEstadoById = async (id, estado) => {
  const query = {
    text: `UPDATE taller.accesorios SET estado_acce = $1 WHERE id_accesorio = $2 RETURNING *`,
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
        a.id_accesorio as id,
        a.nombre,
        a.stock,
        a.precio_costo,
        a.precio_venta
      FROM taller.accesorios a
      WHERE a.codigo_barra = $1
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
          a.id_accesorio as id,
          a.nombre,
          a.stock,
          a.precio_costo,
          a.precio_venta
        FROM taller.accesorios a
        WHERE a.nombre ILIKE $1
        LIMIT 1
      `,
      values: [`%${termino}%`]
    };
    result = await db.query(queryByNombre);
  }
  
  return result.rows[0];
};

//actualizar de parte de compras
const updateStockAndPrices = async (id_accesorio, cantidad, precio_costo, precio_venta) => {
  const query = {
    text: `
      UPDATE taller.accesorios
      SET stock = stock + $2,
          precio_costo = $3,
          precio_venta = $4
      WHERE id_accesorio = $1
      RETURNING *
    `,
    values: [id_accesorio, cantidad, precio_costo, precio_venta]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};


export const AccesorioModel = {
  create,
  getAll,
  findById,
  updateById,
  deleteById,
  cambiarEstadoById,
  buscar,
  updateStockAndPrices
};

