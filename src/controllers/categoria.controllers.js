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

// Obtener una categoría por ID
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

// Actualizar una categoría por ID
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

// Cambiar el estado de una categoría por ID (eliminación lógica)
const estadosCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_cat } = req.body; // true o false
    const result = await CategoriaModel.estadoCategoria(id, estado_cat);
    if (!result) {
      return res.status(404).json({ ok: false, msg: "Categoría no encontrada" });
    }
    return res.json({ ok: true, msg: 'Estado de la categoría actualizado exitosamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el estado de la categoría' });
  }
};

// Eliminar una categoría por ID (eliminación física)
const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CategoriaModel.deleteById(id);
    if (!result) {
      return res.status(404).json({ ok: false, msg: "Categoría no encontrada" });
    }
    return res.sendStatus(204); // Eliminación exitosa
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error del servidor al eliminar la categoría' });
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
