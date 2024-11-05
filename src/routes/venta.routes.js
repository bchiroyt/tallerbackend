import { Router } from "express";
import { VentaController } from "../controllers/venta.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/ventas', verifyToken, VentaController.crearVenta);
router.get('/ventas', verifyToken, VentaController.obtenerVentas);
router.get('/ventas/:id', verifyToken, VentaController.obtenerVenta);

export default router;