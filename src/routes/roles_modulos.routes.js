import { Router } from "express";
import { RolesModulosController } from "../controllers/roles_modulos.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();

router.post('/rolesmodulos/asignar', verifyToken, RolesModulosController.asignarModulo);
router.post('/rolesmodulos/desasignar', verifyToken, RolesModulosController.desasignarModulo);
router.get('/rolesmodulos/:id_rol', verifyToken, RolesModulosController.getPermisosByRol);

export default router;