import { ProveedorModel } from "../models/proveedor.model.js";

// Crear un nuevo proveedor
const crearProveedor = async (req, res) => {
  try {
    const { nombre_compañia, persona_contacto, direccion, telefono } = req.body;
    const nuevoProveedor = await ProveedorModel.create({ nombre_compañia, persona_contacto, direccion, telefono });
    return res.status(201).json({ ok: true, msg: 'Proveedor creado exitosamente', proveedor: nuevoProveedor });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al crear el proveedor' });
  }
};

// Obtener todos los proveedores
const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await ProveedorModel.getAll();
    return res.json({ ok: true, proveedores });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener los proveedores' });
  }
};

// Obtener un proveedor por ID
const obtenerProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await ProveedorModel.findById(id);
    if (!proveedor) {
      return res.status(404).json({ ok: false, msg: "Proveedor no encontrado" });
    }
    return res.json({ ok: true, proveedor });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener el proveedor' });
  }
};

// Actualizar un proveedor por ID
const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_compañia, persona_contacto, direccion, telefono, estado_prov } = req.body;
    const proveedorActualizado = await ProveedorModel.updateById(id, { nombre_compañia, persona_contacto, direccion, telefono, estado_prov });
    if (!proveedorActualizado) {
      return res.status(404).json({ ok: false, msg: "Proveedor no encontrado" });
    }
    return res.json({ ok: true, msg: 'Proveedor actualizado exitosamente', proveedor: proveedorActualizado });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el proveedor' });
  }
};

// Cambiar el estado de un proveedor por ID (eliminación lógica)
const estadosProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_prov } = req.body; // true o false
    const result = await ProveedorModel.estadoProveedor(id, estado_prov);
    if (!result) {
      return res.status(404).json({ ok: false, msg: "Proveedor no encontrado" });
    }
    return res.json({ ok: true, msg: 'Estado del proveedor actualizado exitosamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el estado del proveedor' });
  }
};

// Eliminar un proveedor por ID (eliminación física)
const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProveedorModel.deleteById(id);
    if (!result) {
      return res.status(404).json({ ok: false, msg: "Proveedor no encontrado" });
    }
    return res.sendStatus(204); // Eliminación exitosa
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error del servidor al eliminar el proveedor' });
  }
};

export const ProveedorController = {
  crearProveedor,
  obtenerProveedores,
  obtenerProveedor,
  actualizarProveedor,
  estadosProveedor,
  eliminarProveedor
};