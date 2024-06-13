const Patient = require("./patientModel");

const createPatient = async (req, res) => {
    try {
      const newPatient = await Patient.create(req.body);
      res.status(201).json({ message: "Patient created", data: newPatient});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const getAllPatient = async (req, res, next) => {
    try {
      const patients = await Patient.find({});
      res.status(200).json(patients);
    } catch (error) {
      res.status(500).Json({ message: "Error fetching all patients" });
    }
  };
  
  const getPatientByEmail = async (req, res) => {
    try {
      const email = req.body;
      const patient = await Patient.findOne({ email: email });
      res.status(200).Json(patient);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patient" });
    }
  };
  
  const getPatientById = async (req, res) => {
    try {
      const { patientId } = req.params;
      const patient = await Patient.findById(patientId);
      if(!patient) {
        res.status(404).json({message: "Patient not found"})
      }
      res.status(200).json(patient)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  const updatePatient = async (req, res) => {
    try {
  
      const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true
      })
  
      if(!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      res.status(200).json({message: "patient updated", data:patient})
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  module.exports = {
    getAllPatient,
    getPatientByEmail,
    getPatientById,
    createPatient,
    updatePatient,
  }