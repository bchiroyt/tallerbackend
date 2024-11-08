import { Router } from "express";
import { ReportesController } from "../controllers/reportes.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.get('/ingresos', verifyToken, ReportesController.obtenerReportesIngresos);
router.get('/ventas', verifyToken, ReportesController.obtenerReportesVentas);

export default router;