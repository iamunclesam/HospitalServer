const Admin = require("../admin/adminModel");
const MedicalHistory = require("../medicalHistory/medicalHistoryModel");
const Patient = require("../patient/patientModel");
const Prescription = require("../prescription/prescriptionModel");
const Doctor = require("./doctorModel");
const createHttpError = require("http-errors");



/** accessed by doctor and admin */
const getDoctorAssignedPatients = async (req, res) => {
    try {
      const { aud: userId, role } = req.payload; // Extract user ID and role from the token payload
      console.log(`User ID: ${userId}, Role: ${role}`);
  
      let doctorId;
  
      if (role === 'admin') {
        // Admin must provide the doctorId in the query parameters
        doctorId = req.query.doctorId;
  
        if (!doctorId) {
          return res.status(400).json({ message: "Doctor ID must be provided by admin" });
        }
      } else if (role === 'doctor') {
        // For doctors, use their own ID
        doctorId = userId;
      } else {
        // Invalid role
        return res.status(403).json({ message: "Access forbidden: invalid role" });
      }
  
      const doctorPatients = await Doctor.findById(doctorId);
  
      if (!doctorPatients) {
        return res.status(404).json({ message: "No doctor found!" });
      }
  
      console.log(doctorPatients)
  
      const data = doctorPatients.assignedPatient;
      res.status(200).json({ message: "Patients found", data: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  /** accessed by doctor and admin */
  const createCurrentRecord = async (req, res) => {
    try {
      const { patientId } = req.params;
      const {
        assignedDoctor,
        dateOfAdmission,
        symptoms,
        diagnosis,
        treatmentPlan,
        medications,
        notes,
      } = req.body;
  
      // Validate patient ID
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      // Validate doctor ID
      const doctor = await Doctor.findById(assignedDoctor);
      if (!doctor) {
        return res.status(404).json({ message: "Assigned doctor not found" });
      }
  
      // Create a new record
      const newRecord = {
        assignedDoctor,
        dateOfAdmission,
        symptoms,
        diagnosis,
        treatmentPlan,
        medications,
        notes,
      };
  
      // Add the new record to the patient's currentRecord array
      patient.currentRecord.push(newRecord);
  
      // Save the updated patient document
      await patient.save();
  
      // Re-populate the new record to include related fields
      const updatedPatient = await Patient.findById(patientId).populate(
        "currentRecord.assignedDoctor"
      );
      const createdRecord =
        updatedPatient.currentRecord[updatedPatient.currentRecord.length - 1];
  
      res
        .status(201)
        .json({
          message: "Current record created successfully",
          data: createdRecord,
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  /** accessed by doctor and admin */
  const viewPatientRecords = async (req, res) => {
    try {
      const { patientId } = req.params;
      const doctorId = req.payload.aud; // Assuming doctor ID is extracted from the authenticated user
  
      const patient = await Patient.findById(patientId).populate(
        "currentRecord.assignedDoctor"
      );
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      let doctorAssignedRecord = null;
      for (const record of patient.currentRecord) {
        if (record.assignedDoctor && record.assignedDoctor._id.equals(doctorId)) {
          doctorAssignedRecord = record;
          break;
        }
      }
  
      if (!doctorAssignedRecord) {
        return res.status(403).json({
          message:
            "Access denied: No records assigned to this doctor for this patient",
        });
      }
  
      const data = {
        patientRecord: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          currentRecord: patient.currentRecord,
        },
      };
  
      res.status(200).json({ message: "Patient records found", data: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  /** accessed by doctor and admin */
  const updatePatientRecords = async (req, res) => {
    try {
      const { patientId, recordId } = req.params;
      const doctorId = req.payload.aud;
  
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      // Find the specific record by its ID within the currentRecord array
      const record = patient.currentRecord.find((record) =>
        record._id.equals(recordId)
      );
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
  
      // Ensure the record is assigned to the requesting doctor
      if (!record.assignedDoctor.equals(doctorId)) {
        return res
          .status(403)
          .json({ message: "Access denied: Record not assigned to this doctor" });
      }
  
      // Update the record with the provided data
      Object.assign(record, req.body);
  
      // Save the updated patient document
      await patient.save();
  
      // Re-populate the updated record to include related fields
      const updatedPatient = await Patient.findById(patientId).populate(
        "currentRecord.assignedDoctor"
      );
      const updatedRecord = updatedPatient.currentRecord.find((record) =>
        record._id.equals(recordId)
      );
  
      res
        .status(200)
        .json({ message: "Patient record updated", data: updatedRecord });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  /** accessed by doctor*/
  const writePrescription = async (req, res) => {
    // Logic to write a prescription
    try {
      const { patientId, doctorId, recordId } = req.params;
      const { medications, instructions, date } = req.body;
  
      const patient = await Patient.findById(patientId);
      if (!patient) {
        res.status(404).json({ message: "Patient not found" });
      }
  
      const record = patient.currentRecord.find((record) =>
        record._id.equals(recordId)
      );
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
  
      if (!record.assignedDoctor.equals(doctorId)) {
        res
          .status(403)
          .json({
            message: "Doctor have no permission to prescribe to this patient",
          });
      }
  
      // Create a new prescription
      const prescription = new Prescription({
        patient: patientId,
        doctor: doctorId,
        medications,
        instructions,
        date: new Date(),
      });
  
      // Save the prescription
      await prescription.save();
  
      // Add the prescription to the patient's current record
      record.prescriptions = record.prescriptions || [];
      record.prescriptions.push(prescription);
  
      // Save the updated patient record
      await patient.save();
  
      res
        .status(201)
        .json({ message: "Prescription written successfully", prescription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  /** accessed by doctor and admin */
  const admitPatient = async (req, res) => {
    // Logic to admit a patient
  };
  
  /** accessed by doctor and admin */
  const getMedicalHistory = async (req, res) => {
    try {
      const { patientId } = req.params;
      const patient = await Patient.findById(patientId);
  
      if (!patient) {
        return res.status(404).json({ message: "Patient Not Found" });
      }
      const medicalHistory = await MedicalHistory.findOne({
        patient: patientId,
      }).populate("records.assignedDoctor");
  
      if (!medicalHistory) {
        return res
          .status(404)
          .json({ message: "No medical history found for this patient" });
      }
  
      res
        .status(200)
        .json({
          message: "Medical history retrieved successfully",
          data: medicalHistory,
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  /** accessed by doctor and admin */
  const dischargePatient = async (req, res) => {
    try {
      const { patientId } = req.params;
      const doctorId = req.payload.aud;
  
      // Find the patient by ID
      const patient = await Patient.findById(patientId).populate({
        path: "currentRecord.assignedDoctor",
        select: "_id", // Include only the _id field
      });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
  
      // Check if there are current records
      if (patient.currentRecord.length === 0) {
        return res
          .status(400)
          .json({ message: "No current record to discharge" });
      }
  
      // Create a new medical history entry
      const medicalHistory = new MedicalHistory({
        patient: patient._id,
        records: patient.currentRecord.map((record) => ({
          ...record.toObject(),
          dateOfDischarge: new Date(), // Set the discharge date
        })),
      });
  
      // Save the medical history entry
      await medicalHistory.save();
  
      // Clear the current record of the patient
      patient.currentRecord = [];
  
      // Remove the patient from the doctor's assigned patients list
      doctor.assignedPatient = doctor.assignedPatient.filter(
        (assigned) => !assigned.patient.equals(patientId)
      );
  
      await doctor.save();
      await patient.save();
  
      res.status(200).json({ message: "Patient dischargedy" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  /** accessed by doctor */
  const createTreatmentPlan = async (req, res) => {
    // Logic to create a treatment plan
  };
  
  const referPatient = async (req, res) => {
    // Logic to refer a patient
  };
  
  const sendMessage = async (req, res) => {
    // Logic to send a message
  };
  
  const accessEmergencyInfo = async (req, res) => {
    // Logic to access emergency information
  };
  
  module.exports = {
    viewPatientRecords,
    createCurrentRecord,
    updatePatientRecords,
    writePrescription,
    admitPatient,
    createTreatmentPlan,
    referPatient,
    sendMessage,
    accessEmergencyInfo,
    getDoctorAssignedPatients,
    dischargePatient,
    getMedicalHistory,
  };
  