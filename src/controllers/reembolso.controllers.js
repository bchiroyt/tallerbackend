// reembolso.controller.js
import { ReembolsoModel } from '../models/reembolso.model.js';

const crearReembolso = async (req, res) => {
  try {
    const reembolsoData = {
      ...req.body,
      // Cambiamos req.usuario.id por req.usuario.id_usuario
      id_usuario: req.usuario.id_usuario
    };

    // Validaciones básicas
    if (!reembolsoData.id_venta || !reembolsoData.items || !reembolsoData.items.length) {
      return res.status(400).json({
        ok: false,
        msg: 'Datos incompletos para el reembolso'
      });
    }

    const reembolso = await ReembolsoModel.crearReembolso(reembolsoData);

    res.status(201).json({
      ok: true,
      msg: 'Reembolso procesado exitosamente',
      reembolso
    });
  } catch (error) {
    console.error('Error al crear el reembolso:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al procesar el reembolso',
      error: error.message
    });
  }
};

const obtenerReembolsosPorVenta = async (req, res) => {
  try {
    const { id_venta } = req.params;
    const reembolsos = await ReembolsoModel.obtenerReembolsosPorVenta(id_venta);

    res.json({
      ok: true,
      reembolsos
    });
  } catch (error) {
    console.error('Error al obtener los reembolsos:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener los reembolsos'
    });
  }
};

export const ReembolsoController = {
  crearReembolso,
  obtenerReembolsosPorVenta
};