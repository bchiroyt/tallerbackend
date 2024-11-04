import { db } from '../database/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const create = async ({ id_cliente, id_usuario, tipo_venta, total_venta, pdf_content }) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const ventaQuery = {
      text: `
        INSERT INTO taller.ventas (id_cliente, id_usuario, tipo_venta, total_venta)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      values: [id_cliente, id_usuario, tipo_venta, total_venta]
    };
    
    const { rows: [venta] } = await client.query(ventaQuery);
    
    // Guardar el PDF
    const pdfFileName = `venta_${venta.id_venta}.pdf`;
    const pdfPath = path.join(__dirname, '..', '..', 'uploads', 'pdfs', pdfFileName);
    fs.writeFileSync(pdfPath, pdf_content);
    
    // Actualizar la URL del PDF en la base de datos
    const updatePdfQuery = {
      text: 'UPDATE taller.ventas SET pdf_url = $1 WHERE id_venta = $2',
      values: [`/uploads/pdfs/${pdfFileName}`, venta.id_venta]
    };
    await client.query(updatePdfQuery);
    
    await client.query('COMMIT');
    return { ...venta, pdf_url: `/uploads/pdfs/${pdfFileName}` };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const createDetalleVenta = async ({ id_venta, tipo_item, id_item, cantidad, precio_unitario, subtotal }) => {
  const query = {
    text: `
      INSERT INTO taller.detalle_venta (id_venta, tipo_item, id_item, cantidad, precio_unitario, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    values: [id_venta, tipo_item, id_item, cantidad, precio_unitario, subtotal]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};

const getVentaById = async (id_venta) => {
  const query = {
    text: `
      SELECT 
        v.*,
        c.nombre as cliente_nombre,
        c.nit as cliente_nit,
        c.direccion as cliente_direccion,
        u.nombre as usuario_nombre,
        json_agg(json_build_object(
          'id_detalle', dv.id_detalle,
          'tipo_item', dv.tipo_item,
          'id_item', dv.id_item,
          'cantidad', dv.cantidad,
          'precio_unitario', dv.precio_unitario,
          'subtotal', dv.subtotal
        )) as detalles
      FROM taller.ventas v
      LEFT JOIN taller.clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN taller.usuarios u ON v.id_usuario = u.id_usuario
      LEFT JOIN taller.detalle_venta dv ON v.id_venta = dv.id_venta
      WHERE v.id_venta = $1
      GROUP BY v.id_venta, c.nombre, c.nit, c.direccion, u.nombre
    `,
    values: [id_venta]
  };
  
  const { rows } = await db.query(query);
  return rows[0];
};

export const VentaModel = {
  create,
  createDetalleVenta,
  getVentaById
};