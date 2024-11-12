import { Router } from "express";
import { ConsultasController } from "../controllers/consultas.controller.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

// Rutas para ventas
router.get('/ventas', verifyToken, ConsultasController.getAllVentas);
router.get('/ventas/:id/detalles', verifyToken, ConsultasController.getDetalleVenta);

// Rutas para compras
router.get('/compras', verifyToken, ConsultasController.getAllCompras);
router.get('/compras/:id/detalles', verifyToken, ConsultasController.getDetalleCompra);

export default router;