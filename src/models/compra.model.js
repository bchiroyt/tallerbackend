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
    precio_venta,
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
       cantidad, precio_unitario, precio_venta, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      precio_venta,
      subtotal
    ]
  };
  
  const { rows } = await db.query(query);
  
  // Actualizar stock y precios según tipo de producto
  let updateQuery;
  if (tipo_producto === 'producto') {
    updateQuery = {
      text: `
        UPDATE taller.productos 
        SET stock = stock + $1,
            precio_costo = $2,
            precio_venta = $3
        WHERE id_producto = $4
        RETURNING nombre
      `,
      values: [cantidad, precio_unitario, precio_venta, id_producto]
    };
  } else if (tipo_producto === 'accesorio') {
    updateQuery = {
      text: `
        UPDATE taller.accesorios 
        SET stock = stock + $1,
            precio_costo = $2,
            precio_venta = $3
        WHERE id_accesorio = $4
        RETURNING nombre
      `,
      values: [cantidad, precio_unitario, precio_venta, id_accesorio]
    };
  } else if (tipo_producto === 'bicicleta') {
    updateQuery = {
      text: `
        UPDATE taller.bicicletas 
        SET stock = stock + $1,
            precio_costo = $2,
            precio_venta = $3
        WHERE id_bicicleta = $4
        RETURNING nombre
      `,
      values: [cantidad, precio_unitario, precio_venta, id_bicicleta]
    };
  }

  const updateResult = await db.query(updateQuery);
  return {
    detalle: rows[0],
    nombreProducto: updateResult.rows[0]?.nombre
  };
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
      ORDER BY c.fecha_compra DESC
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
      SELECT 
        dc.*,
        COALESCE(p.nombre, a.nombre, b.nombre) as nombre_producto,
        COALESCE(p.codigo, a.codigo_barra, b.codigo) as codigo_producto
      FROM taller.detalle_compra dc
      LEFT JOIN taller.productos p ON dc.id_producto = p.id_producto
      LEFT JOIN taller.accesorios a ON dc.id_accesorio = a.id_accesorio
      LEFT JOIN taller.bicicletas b ON dc.id_bicicleta = b.id_bicicleta
      WHERE dc.id_compra = $1
    `,
    values: [id_compra]
  };
  
  const { rows } = await db.query(query);
  return rows;
};

const updatePdfPath = async (id_compra, pdfPath) => {
  const query = {
    text: `
      UPDATE taller.compras 
      SET pdf = $1 
      WHERE id_compra = $2 
      RETURNING *
    `,
    values: [pdfPath, id_compra]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};

export const CompraModel = {
  create,
  addDetail,
  updateStock,
  getLastComprobanteNumber,
  getAllCompras,
  getCompraById,
  getDetallesCompra,
  updatePdfPath
};