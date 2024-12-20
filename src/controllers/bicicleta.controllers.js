import { BicicletaModel } from "../models/bicicleta.model.js";
import path from 'path';

// Crear una nueva bicicleta
const crearBicicleta = async (req, res) => {
  try {
    const { 
      id_categoria, codigo, nombre, marca, modelo, precio_costo, precio_venta, stock, tipo_bicicleta 
    } = req.body;
    
    // Hacer la imagen opcional
    const imagen = req.file ? '/uploads/' + path.basename(req.file.path) : '/uploads/default.png';
    
    const nuevaBicicleta = await BicicletaModel.create({ 
      id_categoria, codigo, nombre, marca, modelo, precio_costo, precio_venta, stock, imagen, tipo_bicicleta 
    });
    
    return res.status(201).json({ 
      ok: true, 
      msg: 'Bicicleta creada exitosamente', 
      bicicleta: nuevaBicicleta 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      ok: false, 
      msg: 'Error al crear la bicicleta', 
      error: error.message 
    });
  }
};

// Obtener todas las bicicletas
const obtenerBicicletas = async (req, res) => {
  try {
    const { categoriaId, busqueda, ordenId = 'asc', ordenNombre = 'asc' } = req.query; 
    const bicicletas = await BicicletaModel.getAll(categoriaId, busqueda, ordenId, ordenNombre); 
    return res.json({ ok: true, bicicletas });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener las bicicletas' });
  }
};

// Obtener una bicicleta por ID
const obtenerBicicleta = async (req, res) => {
  try {
    const { id } = req.params;
    const bicicleta = await BicicletaModel.findById(id);
    if (!bicicleta) {
      return res.status(404).json({ ok: false, msg: "Bicicleta no encontrada" });
    }
    return res.json({ ok: true, bicicleta });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener la bicicleta' });
  }
};

// Actualizar una bicicleta
const actualizarBicicleta = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      id_categoria, codigo, nombre, marca, modelo, precio_costo, precio_venta, stock, tipo_bicicleta 
    } = req.body;

    const bicicletaActual = await BicicletaModel.findById(id);
    if (!bicicletaActual) {
      return res.status(404).json({ ok: false, msg: "Bicicleta no encontrada" });
    }

    const bicicletaActualizada = {
      id_categoria: id_categoria || bicicletaActual.id_categoria,
      codigo: codigo || bicicletaActual.codigo,
      nombre: nombre || bicicletaActual.nombre,
      marca: marca || bicicletaActual.marca,
      modelo: modelo || bicicletaActual.modelo,
      precio_costo: precio_costo || bicicletaActual.precio_costo,
      precio_venta: precio_venta || bicicletaActual.precio_venta,
      stock: stock || bicicletaActual.stock,
      imagen: req.file ? '/uploads/' + path.basename(req.file.path) : bicicletaActual.imagen,
      tipo_bicicleta: tipo_bicicleta || bicicletaActual.tipo_bicicleta
    };

    const resultado = await BicicletaModel.updateById(id, bicicletaActualizada);
    return res.json({ 
      ok: true, 
      msg: 'Bicicleta actualizada exitosamente', 
      bicicleta: resultado 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      ok: false, 
      msg: 'Error al actualizar la bicicleta' 
    });
  }
};


// Cambiar el estado de una bicicleta por ID
const cambiarEstadoBicicleta = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; 


    if (typeof estado !== 'boolean') {
      return res.status(400).json({ ok: false, msg: 'El estado debe ser un valor booleano (true o false)' });
    }

    const bicicletaActualizada = await BicicletaModel.cambiarEstadoById(id, estado);
    if (!bicicletaActualizada) {
      return res.status(404).json({ ok: false, msg: "Bicicleta no encontrada" });
    }

    return res.json({ ok: true, msg: 'Estado de la bicicleta actualizado exitosamente', bicicleta: bicicletaActualizada });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el estado de la bicicleta', error: error.message });
  }
};

const buscarBicicletas = async (req, res) => {
  try {
    const { termino } = req.query;
    if (!termino) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'El término de búsqueda es requerido' 
      });
    }

    const bicicleta = await BicicletaModel.buscar(termino);
    
    if (!bicicleta) {
      return res.status(404).json({ 
        ok: false, 
        msg: 'No se encontró ninguna bicicleta con ese código o nombre' 
      });
    }

    return res.json({ 
      ok: true, 
      bicicleta 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      ok: false, 
      msg: 'Error al buscar bicicletas' 
    });
  }
};

export const BicicletaController = {
  crearBicicleta,
  obtenerBicicletas,
  obtenerBicicleta,
  actualizarBicicleta,
  cambiarEstadoBicicleta,
  buscarBicicletas
};