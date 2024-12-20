import { RolModel } from "../models/rol.model.js";

const getAllRoles = async (req, res) => {
  try {
    const roles = await RolModel.getAll();
    res.json({ ok: true, roles });
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener roles" });
  }
};

// Crear un nuevo rol
const createRol = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const nuevoRol = await RolModel.create({ nombre, descripcion });
    res.status(201).json({ ok: true, msg: 'Rol creado exitosamente', rol: nuevoRol });
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ ok: false, msg: "Error al crear rol" });
  }
};

// Eliminar un rol
const deleteRol = async (req, res) => {
  try {
    const { id_rol } = req.params;
    
    // Proteger el rol con id_rol = 1
    if (id_rol === '1') {
      return res.status(403).json({ 
        ok: false, 
        msg: "No se puede eliminar el rol de administrador" 
      });
    }

    const result = await RolModel.deleteById(id_rol);
    if (!result) {
      return res.status(404).json({ 
        ok: false, 
        msg: "Rol no encontrado" 
      });
    }

    res.json({ 
      ok: true, 
      msg: 'Rol eliminado exitosamente. Los usuarios asociados han sido asignados al rol de administrador' 
    });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ 
      ok: false, 
      msg: "Error al eliminar rol y actualizar usuarios" 
    });
  }
};

export const RolController = {
  getAllRoles,
  createRol,  
  deleteRol  
};