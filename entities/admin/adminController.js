const Doctor = require("../doctor/doctorModel");
const Patient = require("../patient/patientModel");

const assignPatientToDoctor = async (req, res) => {
  try {
    const { email } = req.body;
    const { doctorId } = req.params;

    // Find the patient by email
    const patient = await Patient.findOne({ email: email });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if there is a current record
    let currentRecord = patient.currentRecord[0];
    if (!currentRecord) {
      // If no current record, create a new one
      currentRecord = {
        assignedDoctor: doctor._id,
        dateOfAdmission: new Date(),
      };
      patient.currentRecord.push(currentRecord);
    } else {
      // If there is a current record, update the assigned doctor
      currentRecord.assignedDoctor = doctor._id;
    }

     // Ensure assignedPatients is initialized as an array
     if (!doctor.assignedPatient) {
        doctor.assignedPatient = [];
    }

    // Check if the patient is already assigned to the doctor
    const doctorRecord = doctor.assignedPatient.find(record => record.patient.equals(patient._id));
    if (!doctorRecord) {
        doctor.assignedPatient.push({
            patient: patient._id,
            date: new Date()
        });
    }


    // Save the updates
    await patient.save();
    await doctor.save();

    // Send a success response
    res
      .status(200)
      .json({ message: "Patient assigned to doctor successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  assignPatientToDoctor,
};
