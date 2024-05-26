const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoute } = require('../../middlewares/auth');

const {createPatient, getAllPatient, updatePatient, getPatientById} = require("../patient/patientController")

router.post("/add-patient", createPatient);

router.get("/all-patients", getAllPatient)

router.put("/update-patient", updatePatient)

router.get("/patient", getPatientById)

module.exports = router