const mongoose = require("mongoose");
const Role = require("../models/Role");

const createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body);
    return res.status(201).json(role);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Role name already exists" });
    }
    return res.status(400).json({ message: error.message });
  }
};

const getAllRoles = async (_req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false }).sort({ createdAt: -1 });
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid role id" });
    }

    const role = await Role.findOne({ _id: id, isDeleted: false });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.json(role);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid role id" });
    }

    const role = await Role.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.json(role);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Role name already exists" });
    }
    return res.status(400).json({ message: error.message });
  }
};

const deleteRoleSoft = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid role id" });
    }

    const role = await Role.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.json({ message: "Role deleted (soft)" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRoleSoft,
};
