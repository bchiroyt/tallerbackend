import { Router } from "express";
import { AccesorioController } from "../controllers/accesorio.controllers.js";
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


router.post('/accesorios', verifyToken, upload.single('imagen'), AccesorioController.crearAccesorio);  
router.get('/accesorios', verifyToken, AccesorioController.obtenerAccesorios);  
router.get('/accesorios/buscar', verifyToken, AccesorioController.buscarAccesorios); //buscar por nombre o por codigo
router.get('/accesorios/:id', verifyToken, AccesorioController.obtenerAccesorio);
router.put('/accesorios/:id', verifyToken, upload.single('imagen'), AccesorioController.actualizarAccesorio);  
router.delete('/accesorios/:id', verifyToken, AccesorioController.eliminarAccesorio);  
router.patch('/accesorios/:id/estado', verifyToken, AccesorioController.cambiarEstadoAccesorio);

 


export default router;
