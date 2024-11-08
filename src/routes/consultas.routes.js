import { Router } from "express";
import { ReportesController } from "../controllers/consultas.controller.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.get('/ventas', verifyToken, ReportesController.obtenerReportesVentas);
router.get('/ingresos', verifyToken, ReportesController.obtenerReportesIngresos);

export default router;