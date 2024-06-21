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
    // Log the current operation
    console.log('Hashing password for:', this.email);

    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;

    // Log the hashed password
    console.log('Hashed password:', this.password);

    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
DoctorSchema.methods.isValidPassword = async function (password) {
  try {
    // Log the password comparison operation
    console.log('Comparing passwords for:', this.email);

    const result = await bcrypt.compare(password, this.password);

    // Log the comparison result
    console.log('Password match:', result);

    return result;
  } catch (error) {
    throw error;
  }
};

const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;