import { db } from '../database/database.js';

const create = async (compraData) => {
  const { 
    id_proveedor, 
    id_usuario, 
    tipo_comprobante, 
    serie, 
    fecha_facturacion, 
    total_compra 
  } = compraData;
  
  try {
    const ultimoNumero = await getLastComprobanteNumber();
    const numero_comprobante = ultimoNumero + 1;

    const query = {
      text: `
        INSERT INTO taller.compras 
        (id_proveedor, id_usuario, tipo_comprobante, numero_comprobante, 
         serie, fecha_facturacion, total_compra)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      values: [
        id_proveedor, 
        id_usuario, 
        tipo_comprobante, 
        numero_comprobante,
        serie, 
        fecha_facturacion, 
        total_compra
      ]
    };
    
    const { rows } = await db.query(query);
    return rows[0];
  } catch (error) {
    console.error('Error en create compra:', error);
    throw error;
  }
};

const addDetail = async (detalleData) => {
  const { 
    id_compra, 
    tipo_producto, 
    id_producto, 
    cantidad, 
    precio_unitario, 
    subtotal 
  } = detalleData;
  
  let id_accesorio = null;
  let id_bicicleta = null;
  
  // Asignar el ID al campo correcto según el tipo
  switch(tipo_producto) {
    case 'accesorio':
      id_accesorio = id_producto;
      break;
    case 'bicicleta':
      id_bicicleta = id_producto;
      break;
  }

  const query = {
    text: `
      INSERT INTO taller.detalle_compra 
      (id_compra, tipo_producto, id_producto, id_accesorio, id_bicicleta,
       cantidad, precio_unitario, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    values: [
      id_compra,
      tipo_producto,
      tipo_producto === 'producto' ? id_producto : null,
      id_accesorio,
      id_bicicleta,
      cantidad,
      precio_unitario,
      subtotal
    ]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};

const updateStock = async (tipo_producto, id_producto, cantidad) => {
  let tableName;
  let idColumnName;
  
  switch(tipo_producto) {
    case 'accesorio':
      tableName = 'accesorios';
      idColumnName = 'id_accesorio';
      break;
    case 'bicicleta':
      tableName = 'bicicletas';
      idColumnName = 'id_bicicleta';
      break;
    case 'producto':
      tableName = 'productos';
      idColumnName = 'id_producto';
      break;
    default:
      throw new Error('Tipo de producto no válido');
  }
  
  const query = {
    text: `
      UPDATE taller.${tableName}
      SET stock = stock + $1
      WHERE ${idColumnName} = $2
      RETURNING *
    `,
    values: [cantidad, id_producto]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};

const getLastComprobanteNumber = async () => {
  const query = {
    text: 'SELECT MAX(numero_comprobante) as ultimo_numero FROM taller.compras'
  };
  
  const { rows } = await db.query(query);
  return rows[0].ultimo_numero || 0;
};

const getAllCompras = async () => {
  const query = {
    text: `
      SELECT c.*, p.nombre_compañia as proveedor_nombre
      FROM taller.compras c
      LEFT JOIN taller.proveedores p ON c.id_proveedor = p.id_proveedor
      ORDER BY c.fecha_facturacion DESC
    `
  };
  
  const { rows } = await db.query(query);
  return rows;
};

const getCompraById = async (id) => {
  const query = {
    text: `
      SELECT c.*, p.nombre_compañia as proveedor_nombre
      FROM taller.compras c
      LEFT JOIN taller.proveedores p ON c.id_proveedor = p.id_proveedor
      WHERE c.id_compra = $1
    `,
    values: [id]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};

const getDetallesCompra = async (id_compra) => {
  const query = {
    text: `
      SELECT dc.*, 
             CASE 
               WHEN dc.tipo_producto = 'accesorio' THEN a.nombre
               WHEN dc.tipo_producto = 'bicicleta' THEN b.nombre
               WHEN dc.tipo_producto = 'producto' THEN p.nombre
             END as nombre_producto
      FROM taller.detalle_compra dc
      LEFT JOIN taller.accesorios a ON dc.tipo_producto = 'accesorio' AND dc.id_producto = a.id_accesorio
      LEFT JOIN taller.bicicletas b ON dc.tipo_producto = 'bicicleta' AND dc.id_producto = b.id_bicicleta
      LEFT JOIN taller.productos p ON dc.tipo_producto = 'producto' AND dc.id_producto = p.id_producto
      WHERE dc.id_compra = $1
    `,
    values: [id_compra]
  };
  
  const { rows } = await db.query(query);
  return rows;
};

export const CompraModel = {
  create,
  addDetail,
  updateStock,
  getLastComprobanteNumber,
  getAllCompras,
  getCompraById,
  getDetallesCompra
};