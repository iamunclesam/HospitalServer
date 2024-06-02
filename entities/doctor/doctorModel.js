const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

  password: {
    type: String,
    required: true
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

  assignedPatient: [
    {
      patient: mongoose.Schema.Types.ObjectId,
      date: Date
    }
  ]
});

DoctorSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword;
    next()
  }

  catch(error) {
    next(error)
  }
})

DoctorSchema.methods.isValidPassword = async function (password) {
try {
 return await bcrypt.compare(password, this.password)
} catch (error) {
  throw error
  
}
}
const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;
