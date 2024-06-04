const mongoose = require("mongoose");


const recordSchema =  new mongoose.Schema({
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  symptoms: String,
  diagnosis: String,
  treatmentPlan: String,
  medications: [
    {
      name: String,
      dosage: String,
      frequency: String
    }
  ],
  notes: String,
});

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  contactNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  emergencyContact: {
    name: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
  },

  currentRecord: [recordSchema]
  
});

const Patient = mongoose.model("Patient", PatientSchema);
module.exports = Patient
