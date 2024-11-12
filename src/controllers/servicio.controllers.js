import { ServicioModel } from "../models/servicio.model.js";

// Crear servicio
const crearServicio = async (req, res) => {
  try {
    const servicioData = req.body;
    const nuevoServicio = await ServicioModel.create(servicioData);
    res.status(201).json({ ok: true, servicio: nuevoServicio });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, msg: error.message }); 
  }
};

// Obtener todos los registros de servicio
const obtenerServicios = async (req, res) => {
  try {
    const servicios = await ServicioModel.getAll();
    res.json({ ok: true, servicios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al obtener servicios' });
  }
};

// Obtener un servicio
const obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await ServicioModel.getById(id);
    if (!servicio) return res.status(404).json({ ok: false, msg: 'Servicio no encontrado' });
    res.json({ ok: true, servicio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al obtener servicio' });
  }
};

// actualizar servicio
const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    
    if (data.codigo_servicio && !data.codigo_servicio.startsWith('4')) {
      return res.status(400).json({ ok: false, msg: 'El código de servicio debe comenzar con el número 4.' });
    }

    const servicioActualizado = await ServicioModel.updateById(id, data);
    if (!servicioActualizado) return res.status(404).json({ ok: false, msg: 'Servicio no encontrado' });
    res.json({ ok: true, servicio: servicioActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al actualizar servicio' });
  }
};

// Eliminar servicio
const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await ServicioModel.deleteById(id);
    if (!servicio) return res.status(404).json({ ok: false, msg: 'Servicio no encontrado' });
    res.json({ ok: true, msg: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al eliminar servicio' });
  }
};

export const ServicioController = {
    crearServicio,
    obtenerServicios,
    obtenerServicioPorId,
    actualizarServicio,
    eliminarServicio
};