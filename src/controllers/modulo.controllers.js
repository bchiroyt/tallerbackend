import { ModuloModel } from "../models/modulo.model.js";

// Obtener todos los modulos
const getAllModulos = async (req, res) => {
  try {
    const modulos = await ModuloModel.getAll();
    res.json({ ok: true, modulos });
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener módulos" });
  }
};

// Crear un nuevo modulo
const createModulo = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nuevoModulo = await ModuloModel.create({ nombre });
    res.status(201).json({ ok: true, msg: 'Módulo creado exitosamente', modulo: nuevoModulo });
  } catch (error) {
    console.error("Error al crear módulo:", error);
    res.status(500).json({ ok: false, msg: "Error al crear módulo" });
  }
};

// Eliminar un modulo
const deleteModulo = async (req, res) => {
  try {
    const { id_modulo } = req.params;
    const result = await ModuloModel.deleteById(id_modulo);
    if (!result) {
      return res.status(404).json({ ok: false, msg: "Módulo no encontrado" });
    }
    res.json({ ok: true, msg: 'Módulo eliminado exitosamente' });
  } catch (error) {
    console.error("Error al eliminar módulo:", error);
    res.status(500).json({ ok: false, msg: "Error al eliminar módulo" });
  }
};

export const ModuloController = {
  getAllModulos,
  createModulo,
  deleteModulo
};