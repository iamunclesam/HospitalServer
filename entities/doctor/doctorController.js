const MedicalHistory = require("../medicalHistory/medicalHistoryModel");
const Patient = require("../patient/patientModel");
const Prescription = require("../prescription/prescriptionModel");
const Doctor = require("./doctorModel");


const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).Json({ message: "Error fetching all doctors" });
  }
};

const getDoctorByEmail = async (req, res) => {
  try {
    const email = req.body;
    const doctor = await Doctor.findOne({ email: email });
    res.status(200).Json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.param;
    const doctor = await Doctor.findById(id);
    res.status(200).Json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const newDoctor = await Doctor.create(req.body);
    res.status(201).json({ message: "Doctor created", data: newDoctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor updated", data: doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**  DOCTOR - PATIENTS */

const getDoctorAssignedPatients = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctorPatients = await Doctor.findById(doctorId);

    if (!doctorPatients) {
      res.status(404).json({ message: "No doctor found!" });
    }

    const data = doctorPatients.assignedPatient;
    res.status(200).json({ message: "patients found", data: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCurrentRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { assignedDoctor, dateOfAdmission, symptoms, diagnosis, treatmentPlan, medications, notes } = req.body;

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
      notes
    };

    // Add the new record to the patient's currentRecord array
    patient.currentRecord.push(newRecord);

    // Save the updated patient document
    await patient.save();

    // Re-populate the new record to include related fields
    const updatedPatient = await Patient.findById(patientId).populate('currentRecord.assignedDoctor');
    const createdRecord = updatedPatient.currentRecord[updatedPatient.currentRecord.length - 1];

    res.status(201).json({ message: "Current record created successfully", data: createdRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { doctorId } = req.params; // Assuming doctor ID is extracted from the authenticated user

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
        currentRecord: patient.currentRecord
      },
    };

    res.status(200).json({ message: "Patient records found", data: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePatientRecords = async (req, res) => {
  try {
    const { patientId, recordId, doctorId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the specific record by its ID within the currentRecord array
    const record = patient.currentRecord.find(record => record._id.equals(recordId));
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Ensure the record is assigned to the requesting doctor
    if (!record.assignedDoctor.equals(doctorId)) {
      return res.status(403).json({ message: "Access denied: Record not assigned to this doctor" });
    }

    // Update the record with the provided data
    Object.assign(record, req.body);

    // Save the updated patient document
    await patient.save();

    // Re-populate the updated record to include related fields
    const updatedPatient = await Patient.findById(patientId).populate('currentRecord.assignedDoctor');
    const updatedRecord = updatedPatient.currentRecord.find(record => record._id.equals(recordId));

    res.status(200).json({ message: "Patient record updated", data: updatedRecord });
  }  catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const writePrescription = async (req, res) => {
  // Logic to write a prescription
  try {
    const { patientId, doctorId, recordId} = req.params;
    const { medications, instructions, date } = req.body;

    const patient = await Patient.findById(patientId);
    if(!patient) {
      res.status(404).json({message: "Patient not found"})
    }

    const record = patient.currentRecord.find(record => record._id.equals(recordId));
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    if(!record.assignedDoctor.equals(doctorId)) {
      res.status(403).json({message: "Doctor have no permission to prescribe to this patient"})
    }


     // Create a new prescription
     const prescription = new Prescription({
      patient: patientId,
      doctor: doctorId,
      medications,
      instructions,
      date: new Date()
    });

    // Save the prescription
    await prescription.save();

    // Add the prescription to the patient's current record
    record.prescriptions = record.prescriptions || [];
    record.prescriptions.push(prescription);

    // Save the updated patient record
    await patient.save();

    res.status(201).json({ message: "Prescription written successfully", prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const admitPatient = async (req, res) => {
  // Logic to admit a patient
};

const getMedicalHistory = async (req, res) => {
  try {
    const {patientId} = req.params;
    const patient = await Patient.findById(patientId);

    if(!patient) {
      return res.status(404).json({message: "Patient Not Found"})
    }
    const medicalHistory = await MedicalHistory.findOne({ patient: patientId }).populate('records.assignedDoctor');

    if (!medicalHistory) {
      return res.status(404).json({ message: "No medical history found for this patient" });
    }

    res.status(200).json({ message: "Medical history retrieved successfully", data: medicalHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const dischargePatient = async (req, res) => {
  try {
    const { patientId, doctorId } = req.params;

    // Find the patient by ID
    const patient = await Patient.findById(patientId).populate({
      path: 'currentRecord.assignedDoctor',
      select: '_id' // Include only the _id field
    });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const doctor = await Doctor.findById(doctorId);
    if(!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if there are current records
    if (patient.currentRecord.length === 0) {
      return res.status(400).json({ message: "No current record to discharge" });
    }

    // Create a new medical history entry
    const medicalHistory = new MedicalHistory({
      patient: patient._id,
      records: patient.currentRecord.map(record => ({
        ...record.toObject(),
        dateOfDischarge: new Date() // Set the discharge date
      }))
    });

    // Save the medical history entry
    await medicalHistory.save();

    // Clear the current record of the patient
    patient.currentRecord = [];
    
     // Remove the patient from the doctor's assigned patients list
     doctor.assignedPatient = doctor.assignedPatient.filter(assigned => !assigned.patient.equals(patientId));

     await doctor.save();
    await patient.save();

    res.status(200).json({ message: "Patient dischargedy" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
  getAllDoctors,
  getDoctorByEmail,
  getDoctorById,
  createDoctor,
  updateDoctor,

  viewPatientRecords,
  createCurrentRecord,
  updatePatientRecords,
  writePrescription,
  admitPatient,
  createTreatmentPlan,
  referPatient,
  sendMessage,
  accessEmergencyInfo,

  /** doc-pat */

  getDoctorAssignedPatients,
  dischargePatient,
  getMedicalHistory
};
