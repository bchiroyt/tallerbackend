import { ConsultasModel } from '../models/consultas.model.js';

export const ReportesController = {
  // Controladores para ventas
  obtenerReportesVentas: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const ventasPorPeriodo = await ConsultasModel.ventasPorPeriodo(fechaInicio, fechaFin);
      const productosMasVendidos = await ConsultasModel.productosMasVendidos(fechaInicio, fechaFin);
      const ventasPorCategoria = await ConsultasModel.ventasPorCategoria(fechaInicio, fechaFin);
      const clientesConMasCompras = await ConsultasModel.clientesConMasCompras(fechaInicio, fechaFin);
      const ventasPorUsuario = await ConsultasModel.ventasPorUsuario(fechaInicio, fechaFin);
      const ventasPorTipoItem = await ConsultasModel.ventasPorTipoItem(fechaInicio, fechaFin);
      const ventasConReembolso = await ConsultasModel.ventasConReembolso(fechaInicio, fechaFin);

      res.json({
        ok: true,
        ventasPorPeriodo,
        productosMasVendidos,
        ventasPorCategoria,
        clientesConMasCompras,
        ventasPorUsuario,
        ventasPorTipoItem,
        ventasConReembolso
      });
    } catch (error) {
      console.error('Error al obtener reportes de ventas:', error);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener reportes de ventas' });
    }
  },

  // Controladores para ingresos
  obtenerReportesIngresos: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const ingresosPorPeriodo = await ConsultasModel.ingresosPorPeriodo(fechaInicio, fechaFin);
      const ingresosPorCategoria = await ConsultasModel.ingresosPorCategoria(fechaInicio, fechaFin);
      const ingresosPorTipoItem = await ConsultasModel.ingresosPorTipoItem(fechaInicio, fechaFin);
      const ingresosPorUsuario = await ConsultasModel.ingresosPorUsuario(fechaInicio, fechaFin);
      const ingresosPorCliente = await ConsultasModel.ingresosPorCliente(fechaInicio, fechaFin);
      const comparativaIngresos = await ConsultasModel.comparativaIngresosMesActualVsAnterior();
      const promedioIngresoDiario = await ConsultasModel.promedioIngresoDiario(fechaInicio, fechaFin);

      res.json({
        ok: true,
        ingresosPorPeriodo,
        ingresosPorCategoria,
        ingresosPorTipoItem,
        ingresosPorUsuario,
        ingresosPorCliente,
        comparativaIngresos,
        promedioIngresoDiario
      });
    } catch (error) {
      console.error('Error al obtener reportes de ingresos:', error);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener reportes de ingresos' });
    }
  },
};