import { ReembolsoModel } from "../models/reembolso.model.js";

const crearReembolso = async (req, res) => {
  try {
    const reembolsoData = {
      ...req.body,
      id_usuario: req.usuario.id // Asumiendo que viene del middleware de autenticación
    };
    
    const reembolso = await ReembolsoModel.create(reembolsoData);
    
    return res.status(201).json({
      ok: true,
      msg: 'Reembolso procesado exitosamente',
      reembolso
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al procesar el reembolso',
      error: error.message
    });
  }
};

const obtenerReembolsos = async (req, res) => {
  try {
    const reembolsos = await ReembolsoModel.getAll();
    return res.json({ ok: true, reembolsos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener los reembolsos'
    });
  }
};

const obtenerReembolso = async (req, res) => {
  try {
    const { id } = req.params;
    const reembolso = await ReembolsoModel.getById(id);
    
    if (!reembolso) {
      return res.status(404).json({
        ok: false,
        msg: 'Reembolso no encontrado'
      });
    }
    
    return res.json({ ok: true, reembolso });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener el reembolso'
    });
  }
};

export const ReembolsoController = {
  crearReembolso,
  obtenerReembolsos,
  obtenerReembolso
};