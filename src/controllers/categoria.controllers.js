import { CategoriaModel } from "../models/categoria.model.js";

// Crear una nueva categoría
const crearCategoria = async (req, res) => {
  try {
    const { nombre_categoria, descripcion } = req.body;
    const nuevaCategoria = await CategoriaModel.create({ nombre_categoria, descripcion });
    return res.status(201).json({ ok: true, msg: 'Categoría creada exitosamente', categoria: nuevaCategoria });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al crear la categoría' });
  }
};

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaModel.getAll();
    return res.json({ ok: true, categorias });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener las categorías' });
  }
}; 

// Obtener una categoria
const obtenerCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaModel.findById(id);
    if (!categoria) {
      return res.status(404).json({ ok: false, msg: "Categoría no encontrada" });
    }
    return res.json({ ok: true, categoria });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener la categoría' });
  }
};

// Actualizar una categoria
const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_categoria, descripcion, estado_cat } = req.body;
    const categoriaActualizada = await CategoriaModel.updateById(id, { nombre_categoria, descripcion, estado_cat });
    if (!categoriaActualizada) {
      return res.status(404).json({ ok: false, msg: "Categoría no encontrada" });
    }
    return res.json({ ok: true, msg: 'Categoría actualizada exitosamente', categoria: categoriaActualizada });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar la categoría' });
  }
};

// Cambiar el estado de una categoria
const estadosCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_cat } = req.body;

    if (typeof estado_cat !== 'boolean') {
      return res.status(400).json({
        ok: false,
        msg: 'El estado debe ser un valor booleano'
      });
    }

    const result = await CategoriaModel.estadoCategoria(id, estado_cat);
    
    let mensaje;
    const { itemsAfectados } = result;
    const totalAfectados = itemsAfectados.productos + itemsAfectados.accesorios + itemsAfectados.bicicletas;

    if (totalAfectados === 0) {
      mensaje = estado_cat 
        ? 'Categoría activada. No hubo cambios en los items relacionados.'
        : 'Categoría desactivada. No hubo cambios en los items relacionados.';
    } else {
      const itemsModificados = [];
      if (itemsAfectados.productos > 0) itemsModificados.push(`${itemsAfectados.productos} productos`);
      if (itemsAfectados.accesorios > 0) itemsModificados.push(`${itemsAfectados.accesorios} accesorios`);
      if (itemsAfectados.bicicletas > 0) itemsModificados.push(`${itemsAfectados.bicicletas} bicicletas`);

      mensaje = `Categoría ${estado_cat ? 'activada' : 'desactivada'}. Se ${estado_cat ? 'activaron' : 'desactivaron'}: ${itemsModificados.join(', ')}`;
    }

    return res.json({
      ok: true,
      msg: mensaje,
      categoria: result.categoria,
      itemsAfectados: result.itemsAfectados
    });

  } catch (error) {
    console.error('Error en estadosCategoria:', error);
    if (error.message === 'Categoría no encontrada') {
      return res.status(404).json({
        ok: false,
        msg: error.message
      });
    }
    return res.status(500).json({
      ok: false,
      msg: 'Error al actualizar el estado de la categoría',
      error: error.message
    });
  }
};

// Eliminar una categoria
const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CategoriaModel.deleteById(id);
    
    const { itemsMovidos, categoriaPorDefecto } = result;
    let mensaje = `Categoría eliminada exitosamente.`;
    
    const elementosMovidos = [];
    if (itemsMovidos.productos > 0) {
      elementosMovidos.push(`${itemsMovidos.productos} productos`);
    }
    if (itemsMovidos.accesorios > 0) {
      elementosMovidos.push(`${itemsMovidos.accesorios} accesorios`);
    }
    if (itemsMovidos.bicicletas > 0) {
      elementosMovidos.push(`${itemsMovidos.bicicletas} bicicletas`);
    }

    if (elementosMovidos.length > 0) {
      mensaje += ` Se movieron a la categoría "${categoriaPorDefecto.nombre_categoria}": ${elementosMovidos.join(', ')}.`;
    }

    return res.json({
      ok: true,
      msg: mensaje,
      categoria: result.categoria
    });

  } catch (error) {
    console.error('Error en eliminarCategoria:', error);
    
    if (error.message === 'No se puede eliminar la categoría por defecto') {
      return res.status(403).json({
        ok: false,
        msg: error.message
      });
    }
    
    if (error.message === 'Categoría no encontrada') {
      return res.status(404).json({
        ok: false,
        msg: error.message
      });
    }
    
    return res.status(500).json({
      ok: false,
      msg: 'Error al eliminar la categoría',
      error: error.message
    });
  }
};

export const CategoriaController = {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoria,
  actualizarCategoria,
  estadosCategoria,
  eliminarCategoria
};
