import { db } from '../database/database.js';

// Crear una nueva categoria 
const create = async({ nombre_categoria, descripcion }) => {
  const query = {
    text: `
    INSERT INTO taller.categorias (nombre_categoria, descripcion, estado_cat) 
    VALUES ($1, $2, TRUE)
    RETURNING id_categoria, nombre_categoria, descripcion, estado_cat
    `,
    values: [nombre_categoria, descripcion]
  };
  const { rows } = await db.query(query);
  return rows[0];
}; 

// Actualizar una categoria
const updateById = async (id, { nombre_categoria, descripcion, estado_cat }) => {
  const query = {
    text: `
      UPDATE taller.categorias 
      SET nombre_categoria = $1, descripcion = $2, estado_cat = $3
      WHERE id_categoria = $4 
      RETURNING id_categoria, nombre_categoria, descripcion, estado_cat
    `,
    values: [nombre_categoria, descripcion, estado_cat, id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Cambiar el estado
const estadoCategoria = async (id, estado_cat) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    
    const categoriaExiste = await client.query(
      'SELECT * FROM taller.categorias WHERE id_categoria = $1',
      [id]
    );

    if (categoriaExiste.rows.length === 0) {
      throw new Error('Categoría no encontrada');
    }

    
    const categoriaQuery = {
      text: `UPDATE taller.categorias 
             SET estado_cat = $1 
             WHERE id_categoria = $2 
             RETURNING *`,
      values: [estado_cat, id]
    };
    const categoriaResult = await client.query(categoriaQuery);

    let itemsAfectados = {
      productos: 0,
      accesorios: 0,
      bicicletas: 0
    };

    
    try {
      const updateProductos = await client.query(
        `UPDATE taller.productos 
         SET estado = $1 
         WHERE id_categoria = $2 AND estado != $1
         RETURNING id_producto`,
        [estado_cat, id]
      );
      itemsAfectados.productos = updateProductos.rowCount;
    } catch (error) {
      console.log('Tabla productos no encontrada o error:', error.message);
    }

   
    try {
      const updateAccesorios = await client.query(
        `UPDATE taller.accesorios 
         SET estado_acce = $1 
         WHERE id_categoria = $2 AND estado_acce != $1
         RETURNING id_accesorio`,
        [estado_cat, id]
      );
      itemsAfectados.accesorios = updateAccesorios.rowCount;
    } catch (error) {
      console.log('Tabla accesorios no encontrada o error:', error.message);
    }

    
    try {
      const updateBicicletas = await client.query(
        `UPDATE taller.bicicletas 
         SET estado = $1 
         WHERE id_categoria = $2 AND estado != $1
         RETURNING id_bicicleta`,
        [estado_cat, id]
      );
      itemsAfectados.bicicletas = updateBicicletas.rowCount;
    } catch (error) {
      console.log('Tabla bicicletas no encontrada o error:', error.message);
    }

    await client.query('COMMIT');
    return {
      categoria: categoriaResult.rows[0],
      itemsAfectados
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Función auxiliar para obtener el conteo de items afectados
const getItemsAfectados = async (client, id_categoria) => {
  const counts = {
    productos: 0,
    accesorios: 0,
    bicicletas: 0
  };

  try {
    const productosCount = await client.query(
      'SELECT COUNT(*) FROM taller.productos WHERE id_categoria = $1',
      [id_categoria]
    );
    counts.productos = parseInt(productosCount.rows[0].count);
  } catch (error) {
    console.log('Tabla productos no encontrada');
  }

  try {
    const accesoriosCount = await client.query(
      'SELECT COUNT(*) FROM taller.accesorios WHERE id_categoria = $1',
      [id_categoria]
    );
    counts.accesorios = parseInt(accesoriosCount.rows[0].count);
  } catch (error) {
    console.log('Tabla accesorios no encontrada');
  }

  try {
    const bicicletasCount = await client.query(
      'SELECT COUNT(*) FROM taller.bicicletas WHERE id_categoria = $1',
      [id_categoria]
    );
    counts.bicicletas = parseInt(bicicletasCount.rows[0].count);
  } catch (error) {
    console.log('Tabla bicicletas no encontrada');
  }

  return counts;
};

// Obtener todas las categorias
const getAll = async () => {
  const query = `SELECT * FROM taller.categorias`;
  const { rows } = await db.query(query);
  return rows;
};

// Buscar una categoria
const findById = async (id) => {
  const query = {
    text: `SELECT * FROM taller.categorias WHERE id_categoria = $1`,
    values: [id]
  };
  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar una categoria
const deleteById = async (id) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    
    if (id === '1' || id === 1) {
      throw new Error('No se puede eliminar la categoría por defecto');
    }

    
    const categoriaExiste = await client.query(
      'SELECT id_categoria, nombre_categoria FROM taller.categorias WHERE id_categoria = $1',
      [id]
    );

    if (categoriaExiste.rows.length === 0) {
      throw new Error('Categoría no encontrada');
    }

    const CATEGORIA_POR_DEFECTO = 1;
    let itemsMovidos = {
      productos: 0,
      accesorios: 0,
      bicicletas: 0
    };

    
    try {
      const productosMovidos = await client.query(
        `UPDATE taller.productos 
         SET id_categoria = $1 
         WHERE id_categoria = $2 
         RETURNING id_producto`,
        [CATEGORIA_POR_DEFECTO, id]
      );
      itemsMovidos.productos = productosMovidos.rowCount;
    } catch (error) {
      console.log('Nota: No se encontraron productos para mover');
    }

    
    try {
      const accesoriosMovidos = await client.query(
        `UPDATE taller.accesorios 
         SET id_categoria = $1 
         WHERE id_categoria = $2 
         RETURNING id_accesorio`,
        [CATEGORIA_POR_DEFECTO, id]
      );
      itemsMovidos.accesorios = accesoriosMovidos.rowCount;
    } catch (error) {
      console.log('Nota: No se encontraron accesorios para mover');
    }

    
    try {
      const bicicletasMovidas = await client.query(
        `UPDATE taller.bicicletas 
         SET id_categoria = $1 
         WHERE id_categoria = $2 
         RETURNING id_bicicleta`,
        [CATEGORIA_POR_DEFECTO, id]
      );
      itemsMovidos.bicicletas = bicicletasMovidas.rowCount;
    } catch (error) {
      console.log('Nota: No se encontraron bicicletas para mover');
    }

    
    const result = await client.query(
      'DELETE FROM taller.categorias WHERE id_categoria = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');
    return {
      categoria: result.rows[0],
      itemsMovidos,
      categoriaPorDefecto: (await client.query(
        'SELECT nombre_categoria FROM taller.categorias WHERE id_categoria = $1',
        [CATEGORIA_POR_DEFECTO]
      )).rows[0]
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const CategoriaModel = {
  create,
  findById,
  updateById,
  estadoCategoria,
  deleteById,
  getAll
};