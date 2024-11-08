import { ReportesModel } from '../models/reportes.model.js';

export const ReportesController = {
  obtenerReportesIngresos: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const reportes = await ReportesModel.obtenerReportesIngresos(fechaInicio, fechaFin);
      res.json({ ok: true, reportes });
    } catch (error) {
      console.error('Error al obtener reportes de ingresos:', error);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener reportes de ingresos' });
    }
  },

  obtenerReportesVentas: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const reportes = await ReportesModel.obtenerReportesVentas(fechaInicio, fechaFin);
      res.json({ ok: true, reportes });
    } catch (error) {
      console.error('Error al obtener reportes de ventas:', error);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener reportes de ventas' });
    }
  }
};