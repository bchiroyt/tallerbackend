import { Router } from "express";
import { CategoriaController } from "../controllers/categoria.controllers.js";
import { verifyToken} from "../middlewares/jwt.middleware.js";

const router = Router();


router.post('/categorias', verifyToken, CategoriaController.crearCategoria);  
router.get('/categorias', verifyToken, CategoriaController.obtenerCategorias);
router.get('/categorias/:id', verifyToken, CategoriaController.obtenerCategoria);
router.put('/categorias/:id', verifyToken, CategoriaController.actualizarCategoria);
router.patch('/categorias/:id/estado', verifyToken, CategoriaController.estadosCategoria); 
router.delete('/categorias/:id', verifyToken, CategoriaController.eliminarCategoria); 

export default router;