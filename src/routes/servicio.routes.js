import { Router } from 'express';
import { ServicioController } from '../controllers/servicio.controllers.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';

const router = Router();

router.get('/servicio', verifyToken, ServicioController.obtenerServicios);
router.get('/servicio/:id', verifyToken, ServicioController.obtenerServicioPorId);
router.post('/servicio', verifyToken, ServicioController.crearServicio);
router.put('/servicio/:id', verifyToken, ServicioController.actualizarServicio);
router.delete('/servicio/:id', verifyToken, ServicioController.eliminarServicio);

export default router;