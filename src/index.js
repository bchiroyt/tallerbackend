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

// Rutas con prefijos más específicos
app.use('/api/usuarios', userRouter);  
app.use('/api/roles', rolRouter);  
app.use('/api/modulos', moduloRouter);  
app.use('/api/roles-modulos', rolesModulosRouter);  
app.use('/api/categorias', categoriaRouter);  
app.use('/api/accesorios', accesorioRouter);  
app.use('/api/productos', productoRouter);
app.use('/api/bicicletas', bicicletaRouter);
app.use('/api/proveedores', proveedorRouter);
app.use('/api/compras', comprasRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/mantenimientos', mantenimientoRouter);
app.use('/api/servicios', servicioRouter);
app.use('/api/ventas', ventasRouter); 
app.use('/api/cajas', cajaRouter);
app.use('/api/reembolsos', reembolsoRouter); 
app.use('/api/reportes', reportesRouter);
app.use('/api/consultas', consultasRouter);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor andando en http://0.0.0.0:${PORT}`);
});