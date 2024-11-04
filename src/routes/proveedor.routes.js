import { Router } from "express";
import { ProveedorController } from "../controllers/proveedor.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();


router.post('/proveedores', verifyToken, ProveedorController.crearProveedor);  
router.get('/proveedores', verifyToken, ProveedorController.obtenerProveedores);
router.get('/proveedores/:id', verifyToken, ProveedorController.obtenerProveedor);
router.put('/proveedores/:id', verifyToken, ProveedorController.actualizarProveedor);
router.patch('/proveedores/:id/estado', verifyToken, ProveedorController.estadosProveedor);
router.delete('/proveedores/:id', verifyToken, ProveedorController.eliminarProveedor);  

export default router;