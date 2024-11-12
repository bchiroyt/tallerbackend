import { ClienteModel } from "../models/cliente.model.js";

// Crear un nuevo cliente
const crearCliente = async (req, res) => {
    try {
      const { nit, nombre, email, direccion, telefono } = req.body; // Agregar nit aquí
      const nuevoCliente = await ClienteModel.create({ nit, nombre, email, direccion, telefono });
      return res.status(201).json({ ok: true, msg: 'Cliente creado exitosamente', cliente: nuevoCliente });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ ok: false, msg: 'Error al crear el cliente' });
    }
  };

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    const clientes = await ClienteModel.getAll();
    return res.json({ ok: true, clientes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener los clientes' });
  }
};

// Obtener un cliente por ID
const obtenerCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await ClienteModel.findById(id);
    if (!cliente) {
      return res.status(404).json({ ok: false, msg: "Cliente no encontrado" });
    }
    return res.json({ ok: true, cliente });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener el cliente' });
  }
};

// Actualizar un cliente por ID
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nit, nombre, email, direccion, telefono } = req.body;
    
    // Primero obtener el cliente actual para mantener su estado
    const clienteActual = await ClienteModel.findById(id);
    if (!clienteActual) {
      return res.status(404).json({ ok: false, msg: "Cliente no encontrado" });
    }

    // Usar el estado actual del cliente
    const clienteActualizado = await ClienteModel.updateById(id, { 
      nit, 
      nombre, 
      email, 
      direccion, 
      telefono, 
      estado_cli: clienteActual.estado_cli // Mantener el estado actual
    });

    return res.json({ ok: true, msg: 'Cliente actualizado exitosamente', cliente: clienteActualizado });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el cliente' });
  }
};

// Cambiar el estado de un cliente por ID (eliminación lógica)
const estadosCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_cli } = req.body; // true o false
    const result = await ClienteModel.estadoCliente(id, estado_cli);
    if (!result) {
      return res.status(404).json({ ok: false, msg: "Cliente no encontrado" });
    }
    return res.json({ ok: true, msg: 'Estado del cliente actualizado exitosamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ok: false, msg: 'Error al actualizar el estado del cliente' });
  }
};



const buscarClientePorNit = async (req, res) => {
  try {
    const { nit } = req.params;
    
    const cliente = await ClienteModel.findByNit(nit);
    
    if (!cliente) {
      return res.status(404).json({ 
        ok: false, 
        msg: "No se encontró ningún cliente con ese NIT" 
      });
    }
    
    return res.json({ 
      ok: true, 
      cliente 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      ok: false, 
      msg: 'Error al buscar el cliente por NIT' 
    });
  }
};

export const ClienteController = {
  crearCliente,
  obtenerClientes,
  obtenerCliente,
  actualizarCliente,
  estadosCliente,
  buscarClientePorNit
};