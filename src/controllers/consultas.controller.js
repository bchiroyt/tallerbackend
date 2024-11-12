import { ConsultasModel } from '../models/consultas.model.js';

const getAllVentas = async (req, res) => {
    try {
        let { fechaInicio, fechaFin, comprobante } = req.query;
        
        
        if (!fechaInicio) {
            const fecha = new Date();
            fecha.setMonth(fecha.getMonth() - 1);
            fechaInicio = fecha.toISOString().split('T')[0];
        }
        
        if (!fechaFin) {
            fechaFin = new Date().toISOString().split('T')[0];
        }

        const ventas = await ConsultasModel.getAllVentas(fechaInicio, fechaFin, comprobante);
        res.json({
            ok: true,
            ventas
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las ventas'
        });
    }
};

const getAllCompras = async (req, res) => {
    try {
        let { fechaInicio, fechaFin, comprobante } = req.query;
        
        
        if (!fechaInicio) {
            const fecha = new Date();
            fecha.setMonth(fecha.getMonth() - 1);
            fechaInicio = fecha.toISOString().split('T')[0];
        }
        
        if (!fechaFin) {
            fechaFin = new Date().toISOString().split('T')[0];
        }

        const compras = await ConsultasModel.getAllCompras(fechaInicio, fechaFin, comprobante);
        res.json({
            ok: true,
            compras
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las compras'
        });
    }
};

const getDetalleVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const detalles = await ConsultasModel.getDetalleVenta(id);
        
        if (!detalles.length) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron detalles para esta venta'
            });
        }

        res.json({
            ok: true,
            detalles
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los detalles de la venta'
        });
    }
};

const getDetalleCompra = async (req, res) => {
    try {
        const { id } = req.params;
        const detalles = await ConsultasModel.getDetalleCompra(id);
        
        if (!detalles.length) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron detalles para esta compra'
            });
        }

        res.json({
            ok: true,
            detalles
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los detalles de la compra'
        });
    }
};

export const ConsultasController = {
    getAllVentas,
    getAllCompras,
    getDetalleVenta,
    getDetalleCompra
};