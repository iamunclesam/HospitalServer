const express = require("express");
const router = express.Router();
const { verifyAccessToken, allowRoles } = require('../../middlewares/auth');
const { getAllDoctors, getDoctorAssignedPatients, viewPatientRecords, updatePatientRecords, dischargePatient, getMedicalHistory, getDoctorByEmail } = require("../doctor/doctorController");
const { setAppointment, updateAppointment, getAllAppointments} = require("../appointment/appointmentController");

router.get("/doctors", verifyAccessToken, allowRoles("admin"), getAllDoctors);

router.get("/doctor-email", verifyAccessToken, allowRoles("admin"), getDoctorByEmail)

router.get("/doctor/patients", verifyAccessToken, allowRoles("admin", "doctor"),getDoctorAssignedPatients)
router.get("/doctor/patients/:patientId/record", viewPatientRecords)
router.put("/doctor/:patientId/:recordId/record-update", updatePatientRecords)
router.post("/doctor/:patientId/appointment", verifyAccessToken, allowRoles("admin", "doctor"), setAppointment )
router.post("/doctor/:patientId/discharge", dischargePatient )

router.get("/doctor/:patientId/history", getMedicalHistory )

router.put("/doctor/:doctorId/:patientId/:appointmentId/update-appointment", updateAppointment )

router.get("/all-appointments", getAllAppointments )


module.exports = router