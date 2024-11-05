import { CajaModel } from "../models/caja.model.js";

const abrirCaja = async (req, res) => {
  try {
    const { monto_inicial } = req.body;
    const id_usuario = req.usuario.id; // Asumiendo que viene del middleware de autenticación
    
    // Verificar que no haya una caja abierta
    const cajaActual = await CajaModel.getCajaActual();
    if (cajaActual) {
      return res.status(400).json({
        ok: false,
        msg: 'Ya existe una caja abierta'
      });
    }
    
    const caja = await CajaModel.abrirCaja({ id_usuario, monto_inicial });
    
    return res.status(201).json({
      ok: true,
      msg: 'Caja abierta exitosamente',
      caja
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al abrir la caja'
    });
  }
};

const cerrarCaja = async (req, res) => {
  try {
    const { id_caja, monto_final } = req.body;
    
    const caja = await CajaModel.cerrarCaja(id_caja, monto_final);
    
    if (!caja) {
      return res.status(404).json({
        ok: false,
        msg: 'Caja no encontrada'
      });
    }
    
    return res.json({
      ok: true,
      msg: 'Caja cerrada exitosamente',
      caja
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al cerrar la caja'
    });
  }
};

const obtenerCajaActual = async (req, res) => {
  try {
    const caja = await CajaModel.getCajaActual();
    
    if (!caja) {
      return res.status(404).json({
        ok: false,
        msg: 'No hay una caja abierta'
      });
    }
    
    return res.json({ ok: true, caja });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener la caja actual'
    });
  }
};

const obtenerHistorial = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const historial = await CajaModel.getHistorial(
      new Date(fecha_inicio),
      new Date(fecha_fin)
    );
    
    return res.json({ ok: true, historial });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener el historial de cajas'
    });
  }
};

export const CajaController = {
  abrirCaja,
  cerrarCaja,
  obtenerCajaActual,
  obtenerHistorial
};