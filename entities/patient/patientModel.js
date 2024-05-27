const mongoose = require("mongoose");

const MedicalHistorySchema = new mongoose.Schema({
  ailment: {
    type: String,
    required: true,
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  medications: {
    type: [String],
    default: [],
  },
  
  dateOfAdmission: {
    type: Date,
    required: true,
  },
  dateOfDischarge: {
    type: Date,
    default: null,
  },
});

const recordSchema =  new mongoose.Schema({
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  dateOfAdmission: {
    type: Date,
    required: true
  },
  dateOfDischarge: Date,
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
  ward: mongoose.Schema.Types.ObjectId
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
