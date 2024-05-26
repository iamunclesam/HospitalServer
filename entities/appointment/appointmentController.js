const Appointment = require('./appointmentModel');
const Patient = require('../../entities/patient/patientModel');
const Doctor = require('../../entities/doctor/doctorModel');

const setAppointment = async (req, res) => {
  try {
    const {  date, reason, status } = req.body;
    const {patientId, doctorId} = req.params

    // Validate patient ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Validate doctor ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Validate appointment date
    if (new Date(date) <= new Date()) {
      return res.status(400).json({ message: 'Appointment date must be in the future' });
    }

    // Create a new appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date,
      reason,
      status
    });

    await appointment.save();

    res.status(201).json({ message: 'Appointment scheduled successfully', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  setAppointment,
  // Other appointment-related functions
};
