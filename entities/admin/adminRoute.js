const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoute } = require('../../middlewares/auth');
const { createDoctor } = require("../doctor/doctorController");

const { assignPatientToDoctor } = require("./adminController");

router.post("/create-account", createDoctor);

// router.put("/update-patient", updatePatient)

router.post("/assign-patient/:doctorId", assignPatientToDoctor)

module.exports = router