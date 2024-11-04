import { Router } from "express";
import { UserController } from "../controllers/usuario.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();


router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile',verifyToken, UserController.profile);


router.get('/usuarios', verifyToken, UserController.getAllUsuarios);
router.get('/usuarios/:iduser', verifyToken, UserController.getUsuario);
router.put('/usuarios/:iduser', verifyToken, UserController.actualizarUsuario);
router.delete('/usuarios/:iduser', verifyToken, UserController.eliminarUsuario);
router.put('/usuarios/:iduser/estado', verifyToken, UserController.cambiarEstadoUsuario);

export default router;