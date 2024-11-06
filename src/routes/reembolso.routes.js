import { Router } from "express";
import { ReembolsoController } from "../controllers/reembolso.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/', verifyToken, ReembolsoController.crearReembolso);
router.get('/caja/:id_caja', verifyToken, ReembolsoController.obtenerReembolsosPorCaja);

export default router;