const Patient = require("../patient/patientModel");
const Doctor = require("../doctor/doctorModel");
const Appointment = require("../appointment/appointmentModel");

const setAppointment = async (req, res) => {
  try {
    const { date, reason, status } = req.body;
    const { patientId } = req.params;
    const userValidationResult = validateUser(req);
    if (userValidationResult.error) {
      return res.status(400).json({ error: userValidationResult.error });
    }

    const { userId, role, doctorId } = userValidationResult;

    // Validate patient ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Validate doctor ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Validate appointment date
    if (new Date(date) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Appointment date must be in the future" });
    }

    // Create a new appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date,
      reason,
      status,
    });

    await appointment.save();

    res
      .status(201)
      .json({ message: "Appointment scheduled successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const userValidationResult = validateUser(req);
    if (userValidationResult.error) {
      return res.status(400).json({ error: userValidationResult.error });
    }

    const { userId, role, doctorId } = userValidationResult;

    const patient = await Patient.findById(patientId).populate(
      "currentRecord.assignedDoctor"
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
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

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.body,
      appointmentId
    );
    res
      .status(200)
      .json({ message: "appointment updated", data: updatedAppointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    res.status(200).json({ data: appointments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  setAppointment,
  updateAppointment,
  getAllAppointments,
  cancelAppointment,
};
