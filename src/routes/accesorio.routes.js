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

// Crear un middleware que haga opcional la imagen
const uploadOptional = (req, res, next) => {
  upload.single('imagen')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ ok: false, msg: 'Error al subir la imagen' });
    } else if (err) {
      return res.status(500).json({ ok: false, msg: err.message });
    }
    next();
  });
};


router.post('/accesorios', verifyToken, uploadOptional, AccesorioController.crearAccesorio);  
router.get('/accesorios', verifyToken, AccesorioController.obtenerAccesorios);  
router.get('/accesorios/buscar', verifyToken, AccesorioController.buscarAccesorios);
router.get('/accesorios/:id', verifyToken, AccesorioController.obtenerAccesorio);
router.put('/accesorios/:id', verifyToken, uploadOptional, AccesorioController.actualizarAccesorio); 
router.patch('/accesorios/:id/estado', verifyToken, AccesorioController.cambiarEstadoAccesorio);

 


export default router;
