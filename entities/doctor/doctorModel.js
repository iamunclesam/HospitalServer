const mongoose = require("mongoose");

const DoctorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  specialty: {
    type: String,
    required: true,
  },

  department: {
    type: String,
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

  assignedPatient: {
    type: String,
    ref: "Patient",
  },
});

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;
