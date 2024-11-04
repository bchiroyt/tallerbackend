import { Router } from 'express';
import { HistorialController }  from '../controllers/historial.controllers.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';

const router = Router();

router.get('/historial', verifyToken, HistorialController.obtenerHistorial);
router.get('/historial/:id', verifyToken, HistorialController.obtenerHistorialPorId);
router.post('/historial', verifyToken, HistorialController.crearHistorial);
router.put('/historial/:id', verifyToken, HistorialController.actualizarHistorial);
router.delete('/historial/:id', verifyToken, HistorialController.eliminarHistorial);

export default router;
