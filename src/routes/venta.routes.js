import { Router } from "express";
import { VentaController } from "../controllers/venta.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/', verifyToken, VentaController.crearVenta);
router.get('/buscar', verifyToken, VentaController.buscarProductos);
router.get('/caja/:id_caja', verifyToken, VentaController.obtenerVentasPorCaja);

export default router;