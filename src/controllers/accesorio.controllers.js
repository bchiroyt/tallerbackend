import { AccesorioModel } from "../models/accesorio.model.js";
import path from 'path';

// Crear un nuevo accesorio
const crearAccesorio = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ ok: false, msg: 'Error: No se ha subido ninguna imagen' });
      }
  
      const { id_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock } = req.body;
      const imagen = '/uploads/' + path.basename(req.file.path); 
      const nuevoAccesorio = await AccesorioModel.create({ id_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock, imagen });
      return res.status(201).json({ ok: true, msg: 'Accesorio creado exitosamente', accesorio: nuevoAccesorio });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ ok: false, msg: 'Error al crear el accesorio', error: error.message });
    }
};

// Obtener todos los accesorios
const obtenerAccesorios = async (req, res) => {
  try {
    const { categoriaId, busqueda, ordenId = 'asc', ordenNombre = 'asc' } = req.query; 
    const accesorios = await AccesorioModel.getAll(categoriaId, busqueda, ordenId, ordenNombre); 
    return res.json({ ok: true, accesorios });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener los accesorios' });
  }
};

// Obtener un accesorio por ID
const obtenerAccesorio = async (req, res) => {
  try {
    const { id } = req.params;
    const accesorio = await AccesorioModel.findById(id);
    if (!accesorio) {
      return res.status(404).json({ ok: false, msg: "Accesorio no encontrado" });
    }
    return res.json({ ok: true, accesorio });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener el accesorio' });
  }
};

// Actualizar un accesorio por ID
const actualizarAccesorio = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_categoria, codigo_barra, nombre, material, precio_costo, precio_venta, stock } = req.body;
    
    
    const accesorioActual = await AccesorioModel.findById(id);
    if (!accesorioActual) {
      return res.status(404).json({ ok: false, msg: "Accesorio no encontrado" });
    }

  
    
    const accesorioActualizado = {
      id_categoria: id_categoria || accesorioActual.id_categoria,
      codigo_barra: codigo_barra || accesorioActual.codigo_barra,
      nombre: nombre || accesorioActual.nombre,
      material: material || accesorioActual.material,
      precio_costo: precio_costo || accesorioActual.precio_costo,
      precio_venta: precio_venta || accesorioActual.precio_venta,
      stock: stock || accesorioActual.stock,
      imagen: req.file ? '/uploads/' + path.basename(req.file.path) : accesorioActual.imagen
    };

    const resultado = await AccesorioModel.updateById(id, accesorioActualizado);
    return res.json({ ok: true, msg: 'Accesorio actualizado exitosamente', accesorio: resultado });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el accesorio' });
  }
};

// Eliminar un accesorio por ID
const eliminarAccesorio = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AccesorioModel.deleteById(id);
    if (!result) {
      return res.status(404).json({ ok: false, msg: "Accesorio no encontrado" });
    }
    return res.sendStatus(204); 
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error del servidor al eliminar el accesorio' });
  }
};

// Cambiar el estado de un accesorio por ID
const cambiarEstadoAccesorio = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_acce } = req.body; 

    
    if (typeof estado_acce !== 'boolean') {
      return res.status(400).json({ ok: false, msg: 'El estado debe ser un valor booleano (true o false)' });
    }

    const accesorioActualizado = await AccesorioModel.cambiarEstadoById(id, estado_acce);
    if (!accesorioActualizado) {
      return res.status(404).json({ ok: false, msg: "Accesorio no encontrado" });
    }

    return res.json({ ok: true, msg: 'Estado del accesorio actualizado exitosamente', accesorio: accesorioActualizado });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el estado del accesorio', error: error.message });
  }
};

//buscar accesorio por nombre o codigo
const buscarAccesorios = async (req, res) => {
  try {
    const { termino } = req.query;
    if (!termino) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'El término de búsqueda es requerido' 
      });
    }

    const accesorio = await AccesorioModel.buscar(termino);
    
    if (!accesorio) {
      return res.status(404).json({ 
        ok: false, 
        msg: 'No se encontró ningún accesorio con ese código o nombre' 
      });
    }

    return res.json({ 
      ok: true, 
      accesorio 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      ok: false, 
      msg: 'Error al buscar accesorios' 
    });
  }
};

export const AccesorioController = {
  crearAccesorio,
  obtenerAccesorios,
  obtenerAccesorio,
  actualizarAccesorio,
  eliminarAccesorio,
  cambiarEstadoAccesorio,
  buscarAccesorios
};

