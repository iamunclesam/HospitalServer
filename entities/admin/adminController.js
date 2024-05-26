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

        // Assign the patient to the doctor
        patient.assignedDoctor = doctor._id;
        doctor.assignedPatient = patient._id;

        // Save the updates
        await patient.save();
        await doctor.save();

        // Send a success response
        res.status(200).json({ message: "Patient assigned to doctor successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}





module.exports = {
    assignPatientToDoctor
}