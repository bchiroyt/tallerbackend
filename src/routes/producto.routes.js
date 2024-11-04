import { Router } from "express";
import { ProductoController } from "../controllers/producto.controllers.js";
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


router.post('/productos', verifyToken, upload.single('imagen'), ProductoController.crearProducto); 
router.get('/productos', verifyToken, ProductoController.obtenerProductos);  
router.get('/productos/buscar', verifyToken, ProductoController.buscarProductos);
router.get('/productos/:id', verifyToken, ProductoController.obtenerProducto);
router.put('/productos/:id', verifyToken, upload.single('imagen'), ProductoController.actualizarProducto);  
router.delete('/productos/:id', verifyToken, ProductoController.eliminarProducto);  
router.patch('/productos/:id/estado', verifyToken, ProductoController.cambiarEstadoProducto); 



export default router;