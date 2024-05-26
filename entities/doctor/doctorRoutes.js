const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoute } = require('../../middlewares/auth');
const { getAllDoctors, getDoctorAssignedPatients, viewPatientRecords, updatePatientRecords, dischargePatient } = require("../doctor/doctorController");
const { setAppointment } = require("../appointment/appointmentController");



router.get("/doctors", getAllDoctors);
router.get("/doctor/patients/:doctorId", getDoctorAssignedPatients)
router.get("/doctor/:doctorId/patients/:patientId/record", viewPatientRecords)
router.put("/doctor/:doctorId/:patientId/:recordId/record-update", updatePatientRecords)
router.post("/doctor/:doctorId/:patientId/appointment", setAppointment )
router.post("/doctor/:doctorId/:patientId/discharge", dischargePatient )

module.exports = router