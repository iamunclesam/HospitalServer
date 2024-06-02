const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoute } = require('../../middlewares/auth');
const { createDoctor, getDoctorAssignedPatients } = require("../doctor/doctorController");


const { assignPatientToDoctor, createAdminAccount, adminLogin } = require("./adminController");
const { verifyAccessToken, allowRoles } = require('../../middlewares/auth');


router.post("/admin/create-account", createAdminAccount);
router.post("/admin/login", adminLogin)

router.post("/doctor/create-account",  verifyAccessToken, allowRoles("admin"), createDoctor);

router.get("/admin/doctor-patients", verifyAccessToken, allowRoles("admin"),getDoctorAssignedPatients)


// router.put("/update-patient", updatePatient)

router.post("/assign-patient/:doctorId", verifyAccessToken, allowRoles("admin", "doctor"),  assignPatientToDoctor)

module.exports = router