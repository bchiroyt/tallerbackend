import { Router } from "express";
import { ReembolsoController } from "../controllers/reembolso.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/reembolsos', verifyToken, ReembolsoController.crearReembolso);
router.get('/reembolsos', verifyToken, ReembolsoController.obtenerReembolsos);
router.get('/reembolsos/:id', verifyToken, ReembolsoController.obtenerReembolso);

export default router;