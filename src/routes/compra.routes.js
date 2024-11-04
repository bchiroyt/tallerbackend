import { Router } from "express";
import { CompraController } from "../controllers/compra.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/compras', verifyToken, CompraController.crearCompra);
router.get('/compras', verifyToken, CompraController.obtenerCompras);
router.get('/compras/:id', verifyToken, CompraController.obtenerCompra);

export default router;