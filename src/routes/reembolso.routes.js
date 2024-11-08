// reembolso.routes.js
import { Router } from "express";
import { ReembolsoController } from "../controllers/reembolso.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/', verifyToken, ReembolsoController.crearReembolso);
router.get('/venta/:id_venta', verifyToken, ReembolsoController.obtenerReembolsosPorVenta);

export default router;