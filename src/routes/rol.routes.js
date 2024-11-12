import { Router } from "express";
import { RolController } from "../controllers/rol.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.get('/roles', verifyToken, RolController.getAllRoles);
router.post('/roles', verifyToken, RolController.createRol);  // Añadir esta línea
router.delete('/roles/:id_rol', verifyToken, RolController.deleteRol);  // Añadir esta línea

export default router;