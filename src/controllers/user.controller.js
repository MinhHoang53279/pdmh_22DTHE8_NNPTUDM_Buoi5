const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");

const createUser = async (req, res) => {
  try {
    const { role } = req.body;

    if (role) {
      if (!mongoose.Types.ObjectId.isValid(role)) {
        return res.status(400).json({ message: "Invalid role id" });
      }

      const existingRole = await Role.findOne({ _id: role, isDeleted: false });
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }
    }

    const user = await User.create(req.body);
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.username) {
        return res.status(409).json({ message: "Username already exists" });
      }
      if (error.keyPattern?.email) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }
    return res.status(400).json({ message: error.message });
  }
};

const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .populate("role")
      .sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findOne({ _id: id, isDeleted: false }).populate("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (req.body.role) {
      if (!mongoose.Types.ObjectId.isValid(req.body.role)) {
        return res.status(400).json({ message: "Invalid role id" });
      }
      const existingRole = await Role.findOne({ _id: req.body.role, isDeleted: false });
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    ).populate("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.username) {
        return res.status(409).json({ message: "Username already exists" });
      }
      if (error.keyPattern?.email) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }
    return res.status(400).json({ message: error.message });
  }
};

const deleteUserSoft = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted (soft)" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const enableUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: "email and username are required" });
    }

    const user = await User.findOneAndUpdate(
      {
        email: email.toLowerCase().trim(),
        username: username.trim(),
        isDeleted: false,
      },
      { status: true },
      { new: true }
    ).populate("role");

    if (!user) {
      return res.status(404).json({ message: "User not found or info mismatch" });
    }

    return res.json({
      message: "User enabled successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const disableUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: "email and username are required" });
    }

    const user = await User.findOneAndUpdate(
      {
        email: email.toLowerCase().trim(),
        username: username.trim(),
        isDeleted: false,
      },
      { status: false },
      { new: true }
    ).populate("role");

    if (!user) {
      return res.status(404).json({ message: "User not found or info mismatch" });
    }

    return res.json({
      message: "User disabled successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUserSoft,
  enableUser,
  disableUser,
};
