const mongoose = require("mongoose");

const AdminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  yearsOfExperience: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["doctor"],
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  phone: {
    type: Number,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
