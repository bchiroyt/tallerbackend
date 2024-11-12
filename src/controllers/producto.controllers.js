import { ProductoModel } from "../models/producto.model.js";
import path from 'path';

// crear un nuevo producto
const crearProducto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, msg: 'Error: No se ha subido ninguna imagen' });
    }

    const { id_categoria, codigo, nombre, precio_costo, precio_venta, stock, marca, descripcion } = req.body;
    const imagen = '/uploads/' + path.basename(req.file.path); 
    const nuevoProducto = await ProductoModel.create({ id_categoria, codigo, nombre, precio_costo, precio_venta, stock, marca, descripcion, imagen });
    return res.status(201).json({ ok: true, msg: 'Producto creado exitosamente', producto: nuevoProducto });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al crear el producto', error: error.message });
  }
};

// btener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const { categoriaId, ordenId = 'asc', ordenNombre = 'asc' } = req.query; 
    const productos = await ProductoModel.getAll(categoriaId, ordenId, ordenNombre); 
    return res.json({ ok: true, productos });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener los productos' });
  }
};

// Obener un producto
const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, msg: 'El ID debe ser un número entero' });
    }
    const producto = await ProductoModel.findById(id);
    if (!producto) {
      return res.status(404).json({ ok: false, msg: "Producto no encontrado" });
    }
    return res.json({ ok: true, producto });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener el producto' });
  }
};

// actualizar un producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_categoria, codigo, nombre, precio_costo, precio_venta, stock, marca, descripcion } = req.body;

    
    const productoActual = await ProductoModel.findById(id);
    if (!productoActual) {
      return res.status(404).json({ ok: false, msg: "Producto no encontrado" });
    }

   
    const productoActualizado = {
      id_categoria: id_categoria || productoActual.id_categoria,
      codigo: codigo || productoActual.codigo,
      nombre: nombre || productoActual.nombre,
      precio_costo: precio_costo || productoActual.precio_costo,
      precio_venta: precio_venta || productoActual.precio_venta,
      stock: stock || productoActual.stock,
      marca: marca || productoActual.marca,
      descripcion: descripcion || productoActual.descripcion,
      imagen: req.file ? '/uploads/' + path.basename(req.file.path) : productoActual.imagen 
    };

    const resultado = await ProductoModel.updateById(id, productoActualizado);
    return res.json({ ok: true, msg: 'Producto actualizado exitosamente', producto: resultado });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el producto' });
  }
};

// cambiar el estado de un producto
const cambiarEstadoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

 
    if (typeof estado !== 'boolean') {
      return res.status(400).json({ ok: false, msg: 'El estado debe ser un valor booleano (true o false)' });
    }

    const productoActualizado = await ProductoModel.cambiarEstadoById(id, estado);
    if (!productoActualizado) {
      return res.status(404).json({ ok: false, msg: "Producto no encontrado" });
    }

    return res.json({ ok: true, msg: 'Estado del producto actualizado exitosamente', producto: productoActualizado });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el estado del producto', error: error.message });
  }
};

// buscar productos codigo o nombre
const buscarProductos = async (req, res) => {
  try {
    const { termino } = req.query;
    if (!termino) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'El término de búsqueda es requerido' 
      });
    }

    const producto = await ProductoModel.buscar(termino);
    
    if (!producto) {
      return res.status(404).json({ 
        ok: false, 
        msg: 'No se encontró ningún producto con ese código o nombre' 
      });
    }

    return res.json({ 
      ok: true, 
      producto 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      ok: false, 
      msg: 'Error al buscar productos' 
    });
  }
};


export const ProductoController = {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  buscarProductos
};

