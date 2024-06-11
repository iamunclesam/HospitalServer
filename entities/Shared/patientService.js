const MedicalHistory = require("../medicalHistory/medicalHistoryModel");
const Patient = require("../patient/patientModel");
const Prescription = require("../prescription/prescriptionModel");
const Doctor = require("../doctor/doctorModel");
const Appointment = require("../appointment/appointmentModel");
const Admission = require("../admission/admissionModel");
const { validateUser } = require("../../utils/authUtil");
const Department = require("../department/departmentModel");
const Ward = require("../ward/wardModel");

const admitPatient = async (req, res) => {
  try {
    const userValidationResult = validateUser(req, res);
    if (userValidationResult.error) {
      return res.status(400).json({ error: userValidationResult.error });
    }

    const { userId, role, doctorId } = userValidationResult;

    const {
      patientId,
      notes,
      reasonForAdmission,
      departmentId,
      wardId,
      roomNumber,
      bedNumber,
    } = req.body;

    if (
      !patientId ||
      !reasonForAdmission ||
      !roomNumber ||
      !departmentId ||
      !wardId ||
      !notes
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [patient, doctor, department, ward] = await Promise.all([
      Patient.findById(patientId),
      Doctor.findById(doctorId),
      Department.findById(departmentId),
      Ward.findById(wardId),
    ]);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (!ward) {
      return res.status(404).json({ message: "Ward not found" });
    }

    const newAdmission = new Admission({
      patient: patient._id,
      assignedDoctor: doctor._id,
      admissionDate: new Date(),
      reasonForAdmission,
      roomNumber,
      notes,
      ward: ward._id,
      departmentId: department._id,
      bedNumber,
    });

    await newAdmission.save();
    console.log("Saved");

    res.status(201).json({
      message: "Patient admitted successfully",
      admission: newAdmission,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const allAdmittedPatient = async (req, res) => {
  try {
    const admittedPatients = await Admission.find({});
    res.status(200).json({ message: "successfully", data: admittedPatients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** accessed by doctor and admin */
const getDoctorAssignedPatients = async (req, res) => {
  try {
    const userValidationResult = validateUser(req, res);
    if (!userValidationResult) return;
    const { userId, role, doctorId } = userValidationResult;
    const doctorPatients = await Doctor.findById(doctorId);

    if (!doctorPatients) {
      return res.status(404).json({ message: "No doctor found!" });
    }
    console.log(doctorPatients);
    const data = doctorPatients.assignedPatient;
    res.status(200).json({ message: "Patients found", data: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** accessed by doctor and admin */
const viewPatientRecords = async (req, res) => {
  try {
    // Check if req.payload exists
    const userValidationResult = validateUser(req, res);
    if (!userValidationResult) return;

    const { userId, role, doctorId } = userValidationResult;

    const patientId = req.params.patientId;

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
const dischargePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userValidationResult = validateUser(req, res);
    if (!userValidationResult) return;

    const { userId, role, doctorId } = userValidationResult;

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

    const admission = await Admission.findOneAndUpdate(
      { patient: patient._id },
      { status: "discharged" },
      { new: true } // Return the updated document
    );

    if (!admission) {
      res.status(404).json({ message: "Patient isnt admitted" });
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
    patient.currentRecord = [];
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

    res.status(200).json({
      message: "Medical history retrieved successfully",
      data: medicalHistory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  viewPatientRecords,
  admitPatient,
  allAdmittedPatient,
  getDoctorAssignedPatients,
  dischargePatient,
  getMedicalHistory,
};
