import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router();



router.post('/clientes', verifyToken, ClienteController.crearCliente);  
router.get('/clientes', verifyToken, ClienteController.obtenerClientes);
router.get('/clientes/:id', verifyToken, ClienteController.obtenerCliente);
router.put('/clientes/:id', verifyToken, ClienteController.actualizarCliente);
router.patch('/clientes/:id/estado', verifyToken, ClienteController.estadosCliente); 
router.delete('/clientes/:id', verifyToken, ClienteController.eliminarCliente); 
router.get('/clientes/nit/:nit', verifyToken, ClienteController.buscarClientePorNit); 


export default router;