const express = require("express");
const router = express.Router();
const { createDoctor,  } = require("../doctor/doctorController");

const {createPatient, getAllPatient, updatePatient, getPatientById} = require("../patient/patientController")

const { assignPatientToDoctor, createAdminAccount, adminLogin } = require("./adminController");

const { verifyAccessToken, allowRoles } = require('../../middlewares/auth');

const { getDoctorAssignedPatients, admitPatient } = require("../Shared/patientService");



/** ADMIN ROUTE */
router.post("/admin/create-account", createAdminAccount);
router.post("/admin/login", adminLogin)


/** DOCTOR */
router.post("admin/create-doctor",  verifyAccessToken, allowRoles("admin"), createDoctor);

router.get("/admin/doctor-patients", verifyAccessToken, allowRoles("admin"), getDoctorAssignedPatients)



/** PATIENTS */

router.post("/admin/add-patient", createPatient);

router.get("/admin/all-patients", getAllPatient)

router.put("/admin/update-patient", updatePatient)

router.get("/admin/patient-details", getPatientById)

router.post("/admin/admit-patient", verifyAccessToken, allowRoles("admin", "doctor"), admitPatient)

router.post("/admin/assign-patient/:doctorId", verifyAccessToken, allowRoles("admin"),  assignPatientToDoctor)




module.exports = router