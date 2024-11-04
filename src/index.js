import cors from 'cors';
import 'dotenv/config';  
import express from 'express';  
import path from 'path';
import { fileURLToPath } from 'url';

import userRouter from './routes/usuario.routes.js';  
import rolRouter from './routes/rol.routes.js';  
import moduloRouter from './routes/modulo.routes.js';  
import rolesModulosRouter from './routes/roles_modulos.routes.js';  
import categoriaRouter from './routes/categoria.routes.js';  
import accesorioRouter from './routes/accesorio.routes.js';
import productoRouter from './routes/producto.routes.js';
import bicicletaRouter from './routes/bicicleta.routes.js';
import proveedorRouter from './routes/proveedor.routes.js';
import comprasRouter from './routes/compra.routes.js'; 
import clientesRouter from './routes/cliente.routes.js'
import mantenimientoRouter from './routes/mantenimineto.routes.js';
import historialRouter from './routes/historial.routes.js';
import ventasRouter from './routes/venta.routes.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();  
app.use(cors());

// Middlewares para manejar datos JSON y formularios enviados desde el frontend
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Cambiado para apuntar al directorio correcto

// Registrar las rutas
app.use('/', userRouter);  
app.use('/', rolRouter);  
app.use('/', moduloRouter);  
app.use('/', rolesModulosRouter);  
app.use('/', categoriaRouter);  
app.use('/', accesorioRouter);  
app.use('/', productoRouter);
app.use('/', bicicletaRouter);
app.use('/', proveedorRouter);
app.use('/', comprasRouter);
app.use('/', clientesRouter);
app.use('/', mantenimientoRouter);
app.use('/', historialRouter);
app.use('/', ventasRouter); 

const PORT = process.env.PORT || 3000;  
app.listen(PORT, () => console.log('Servidor andando en ' + PORT));