import { ReembolsoModel } from '../models/reembolso.model.js';

const crearReembolso = async (req, res) => {
  try {
    const reembolsoData = {
      ...req.body,
      id_usuario: req.usuario.id
    };

    // Validar que no sea un servicio
    const tieneServicios = reembolsoData.items.some(item => 
      item.tipo_item === 'servicio'
    );

    if (tieneServicios) {
      return res.status(400).json({
        ok: false,
        msg: 'No se pueden reembolsar servicios'
      });
    }

    const reembolso = await ReembolsoModel.crearReembolso(reembolsoData);

    return res.status(201).json({
      ok: true,
      msg: 'Reembolso realizado exitosamente',
      reembolso
    });
  } catch (error) {
    console.error('Error al crear reembolso:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al procesar el reembolso'
    });
  }
};

const obtenerReembolsosPorCaja = async (req, res) => {
  try {
    const { id_caja } = req.params;
    const reembolsos = await ReembolsoModel.obtenerReembolsosPorCaja(id_caja);

    return res.json({
      ok: true,
      reembolsos
    });
  } catch (error) {
    console.error('Error al obtener reembolsos:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener los reembolsos'
    });
  }
};

export const ReembolsoController = {
  crearReembolso,
  obtenerReembolsosPorCaja
};