import { HistorialMantenimientoModel } from "../models/historial.model.js";
//import { VentaModel } from "../models/venta.model.js";

// Crear historial y asociar a una venta
export const crearHistorial = async (req, res) => {
  try {
    const historialData = req.body;
    const nuevoHistorial = await HistorialMantenimientoModel.create(historialData);

    // Crear la venta asociada
    const ventaData = {
      id_cliente: historialData.id_cliente,
      id_usuario: historialData.id_usuario,
      fecha_venta: new Date(),
      total_venta: historialData.total_costo,
    };
    const nuevaVenta = await VentaModel.create(ventaData); // Asegúrate de que VentaModel esté definido

    res.status(201).json({ ok: true, historial: nuevoHistorial, venta: nuevaVenta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al crear historial de mantenimiento' });
  }
};
// Obtener todos los registros de historial
export const obtenerHistorial = async (req, res) => {
  try {
    const historial = await HistorialMantenimientoModel.getAll();
    res.json({ ok: true, historial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al obtener historial de mantenimiento' });
  }
};

// Obtener un historial por ID
export const obtenerHistorialPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const historial = await HistorialMantenimientoModel.getById(id);
    if (!historial) return res.status(404).json({ ok: false, msg: 'Historial no encontrado' });
    res.json({ ok: true, historial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al obtener historial de mantenimiento' });
  }
};

// Actualizar historial de mantenimiento
export const actualizarHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const historialActualizado = await HistorialMantenimientoModel.updateById(id, data);
    if (!historialActualizado) return res.status(404).json({ ok: false, msg: 'Historial no encontrado' });
    res.json({ ok: true, historial: historialActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al actualizar historial' });
  }
};

// Eliminar historial de mantenimiento (lógico)
export const eliminarHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const historial = await HistorialMantenimientoModel.deleteById(id);
    if (!historial) return res.status(404).json({ ok: false, msg: 'Historial no encontrado' });
    res.json({ ok: true, msg: 'Historial eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al eliminar historial' });
  }
};

export const HistorialController = {
    crearHistorial,
    obtenerHistorial,
    obtenerHistorialPorId,
    actualizarHistorial,
    eliminarHistorial
  };