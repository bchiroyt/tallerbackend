import { MantenimientoModel } from "../models/mantenimiento.model.js";

// Crear una nueva cita 
const crearCita = async (req, res) => {
  try {
    const nuevaCita = await MantenimientoModel.crearCita(req.body);
    res.status(201).json({ ok: true, cita: nuevaCita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al crear la cita' });
  }
};

// Obtener todas las citas 
const obtenerCitas = async (req, res) => {
  try {
    const citas = await MantenimientoModel.obtenerCitas();
    res.json({ ok: true, citas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al obtener las citas' });
  }
};

// Obtener una cita 
const obtenerCitaPorId = async (req, res) => {
  try {
    const cita = await MantenimientoModel.obtenerCitaPorId(req.params.id);
    if (!cita) return res.status(404).json({ ok: false, msg: 'Cita no encontrada' });
    res.json({ ok: true, cita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al obtener la cita' });
  }
};

// Actualizar estado de una cita
const actualizarEstadoCita = async (req, res) => {
  try {
    const cita = await MantenimientoModel.actualizarEstadoCita(req.params.id, req.body.estado_cita);
    if (!cita) return res.status(404).json({ ok: false, msg: 'Cita no encontrada' });
    res.json({ ok: true, cita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al actualizar el estado de la cita' });
  }
};

// Agregar este controlador
const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const citaActualizada = await MantenimientoModel.actualizarCita(id, req.body);
    
    if (!citaActualizada) {
      return res.status(404).json({ 
        ok: false, 
        msg: 'Cita no encontrada' 
      });
    }

    res.json({ 
      ok: true, 
      msg: 'Cita actualizada exitosamente',
      cita: citaActualizada 
    });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ 
      ok: false, 
      msg: 'Error al actualizar la cita' 
    });
  }
};



export const MantenimientoController = {
  crearCita,
  obtenerCitas,
  obtenerCitaPorId,
  actualizarCita,
  actualizarEstadoCita
};
