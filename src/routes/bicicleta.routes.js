import { Router } from "express";
import { BicicletaController } from "../controllers/bicicleta.controllers.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads')); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});


const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true); 
  }
  cb(new Error('Error: El archivo debe ser una imagen válida')); 
};


const upload = multer({ 
  storage,
  limits: { fileSize: 1024 * 1024 * 1 }, 
  fileFilter 
});


router.post('/bicicletas', verifyToken, upload.single('imagen'), BicicletaController.crearBicicleta);  
router.get('/bicicletas', verifyToken, BicicletaController.obtenerBicicletas);  
router.get('/bicicletas/buscar', verifyToken, BicicletaController.buscarBicicletas);  //ruta de busqueda
router.get('/bicicletas/:id', verifyToken, BicicletaController.obtenerBicicleta);
router.put('/bicicletas/:id', verifyToken, upload.single('imagen'), BicicletaController.actualizarBicicleta);  
router.delete('/bicicletas/:id', verifyToken, BicicletaController.eliminarBicicleta);  
router.patch('/bicicletas/:id/estado', verifyToken, BicicletaController.cambiarEstadoBicicleta);


export default router;