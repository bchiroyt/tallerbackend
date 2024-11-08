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
import servicioRouter from './routes/servicio.routes.js';
import ventasRouter from './routes/venta.routes.js'; 
import cajaRouter from './routes/caja.routes.js';
import reembolsoRouter from './routes/reembolso.routes.js'
import reportesRouter from './routes/reportes.routes.js'
import consultasRouter from './routes/consultas.routes.js'


console.log('JWT_SECRET está configurado:', !!process.env.JWT_SECRET);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();  

// Configuración de CORS más específica
app.use(cors({
  origin: '*', // Cambia esto a los orígenes específicos en producción
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
app.use('/', servicioRouter);
app.use('/ventas', ventasRouter); 
app.use('/cajas', cajaRouter);
app.use('/reembolsos', reembolsoRouter); 
app.use('/reportes', reportesRouter);
app.use('/consultas', consultasRouter);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor andando en http://0.0.0.0:${PORT}`);
});