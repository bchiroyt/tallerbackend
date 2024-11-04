import { Router } from "express";
import { MantenimientoController } from "../controllers/mantenimiento.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/citas', verifyToken, MantenimientoController.crearCita);
router.get('/citas', verifyToken, MantenimientoController.obtenerCitas);
router.get('/citas/:id', verifyToken, MantenimientoController.obtenerCitaPorId);
router.put('/citas/:id/estado', verifyToken, MantenimientoController.actualizarEstadoCita);

export default router;
