import { CajaModel } from '../models/caja.model.js';

const abrirCaja = async (req, res) => {
  try {
    const { monto_inicial } = req.body;
    const id_usuario = req.usuario.id;
    
    // Verificar que no haya una caja abierta
    const cajaActual = await CajaModel.getCajaActual();
    if (cajaActual) {
      return res.status(400).json({
        ok: false,
        msg: 'Ya existe una caja abierta'
      });
    }
    
    const caja = await CajaModel.abrirCaja({ id_usuario, monto_inicial });
    
    // Obtener la caja recién creada con todos los detalles
    const cajaCompleta = await CajaModel.getCajaActual();
    
    return res.status(201).json({
      ok: true,
      msg: 'Caja abierta exitosamente',
      caja: cajaCompleta
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
        msg: 'No hay una caja abierta actualmente'
      });
    }
    
    // Formatear la respuesta
    const cajaFormateada = {
      ...caja,
      fecha_apertura: new Date(caja.fecha_apertura).toLocaleString(),
      fecha_cierre: caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleString() : null,
      estado: caja.estado_caja ? 'Abierta' : 'Cerrada'
    };
    
    return res.json({ 
      ok: true, 
      caja: cajaFormateada 
    });
  } catch (error) {
    console.error('Error al obtener la caja actual:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener la caja actual',
      error: error.message
    });
  }
};

const obtenerHistorial = async (req, res) => {
  try {
    let { fecha_inicio, fecha_fin } = req.query;
    
    // Si no hay fechas, usar un rango amplio para mostrar todo
    if (!fecha_inicio || !fecha_fin) {
      const fechaActual = new Date();
      fecha_inicio = '2000-01-01';
      fecha_fin = fechaActual.toISOString().split('T')[0];
    }
    
    console.log('Consultando historial con fechas:', { fecha_inicio, fecha_fin });
    
    const historial = await CajaModel.getHistorial(fecha_inicio, fecha_fin);
    
    return res.json({ 
      ok: true, 
      historial,
      parametros: { fecha_inicio, fecha_fin }
    });
  } catch (error) {
    console.error('Error en obtenerHistorial:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener el historial de cajas',
      error: error.message
    });
  }
};

export const CajaController = {
  abrirCaja,
  cerrarCaja,
  obtenerCajaActual,
  obtenerHistorial
};