import { Router } from "express";
import { CajaController } from "../controllers/caja.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/abrir', verifyToken, CajaController.abrirCaja);
router.post('/cerrar', verifyToken, CajaController.cerrarCaja);
router.get('/actual', verifyToken, CajaController.obtenerCajaActual);
router.get('/historial', verifyToken, CajaController.obtenerHistorial);

export default router;