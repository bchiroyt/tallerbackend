import { Router } from "express";
import { ModuloController } from "../controllers/modulo.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();



router.get('/modulos', verifyToken, ModuloController.getAllModulos);
router.post('/modulos', verifyToken, ModuloController.createModulo);
router.delete('/modulos/:id_modulo', verifyToken, ModuloController.deleteModulo);

export default router;