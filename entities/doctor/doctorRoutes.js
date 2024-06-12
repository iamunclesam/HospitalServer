const express = require("express");
const router = express.Router();
const { verifyAccessToken, allowRoles } = require("../../middlewares/auth");
const {
  getAllDoctors,
  getDoctorByEmail,
  doctorLogin,
  updatePatientRecords,
} = require("../doctor/doctorController");
const {
  getDoctorAssignedPatients,
  viewPatientRecords,
  dischargePatient,
  getMedicalHistory,
  admitPatient,
  updatePatientCurrentRecord,
} = require("../Shared/patientService");
const {
  setAppointment,
  updateAppointment,
  getAllAppointments,
} = require("../Shared/appointmentService");





router.post("/doctor/login", verifyAccessToken, doctorLogin)

/** FETCH ALL DOCTORS */
router.get("/doctors", getAllDoctors);

/** FETCH DOCTOR BY EMAIL */
router.get(
  "/doctor-email",
  verifyAccessToken,
  allowRoles("admin"),
  getDoctorByEmail
);

/** GET ASSIGNED PATIENT */
router.get(
  "/doctor/patients",
  verifyAccessToken,
  allowRoles("admin", "doctor"),
  getDoctorAssignedPatients
);

/** VIEW PATIENT RECORD */
router.get(
  "/doctor/patients/:patientId/record",
  verifyAccessToken,
  allowRoles("admin", "doctor"),
  viewPatientRecords
);

/** UPDATE PATIENT RECORD */
router.put(
  "/doctor/:patientId/:recordId/record-update",
  verifyAccessToken,
  allowRoles("doctor"),
  updatePatientRecords
);

/** SET APPOINTMENT */
router.post(
  "/doctor/:patientId/appointment",
  verifyAccessToken,
  allowRoles("admin", "doctor"),
  setAppointment
);

/** DISCHARGE PATIENT */
router.post(
  "/doctor/:patientId/discharge",
  verifyAccessToken,
  allowRoles("admin", "doctor"),
  dischargePatient
);

/** GET MEDICAL RECORD */
router.get(
  "/doctor/:patientId/history",
  verifyAccessToken,
  allowRoles("admin", "doctor"),
  getMedicalHistory
);

/** UPDATE APPOINTMENT */
router.put(
  "/doctor/:doctorId/:patientId/:appointmentId/update-appointment",
  verifyAccessToken,
  allowRoles("doctor"),
  updateAppointment
);

/** ADMIT PATIENT */
router.post(
  "/doctor/:patientId/admit-patient",
  verifyAccessToken,
  allowRoles("doctor"),
  admitPatient
);

router.get("/all-appointments", getAllAppointments);

module.exports = router;
