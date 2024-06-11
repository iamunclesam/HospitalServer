const express = require("express")
const { createNurse, getAllNurse, getNurseById, assignedWardPatient, nurseLogin, getPatientMedicalHistory } = require("./nurseController");
const { verifyAccessToken, allowRoles } = require("../../middlewares/auth");
const router = express.Router();

router.post("/nurse/create-account",  verifyAccessToken, allowRoles("admin"), createNurse);

router.post("/nurse/login",  nurseLogin);

router.get("/nurses", getAllNurse);
router.get("/nurse/:nurseId/", getNurseById);

router.get("/nurse/:patient/:wardId/medical-record",   verifyAccessToken, allowRoles("nurse"), getPatientMedicalHistory)


router.get("/nurse/:wardId/patients",  verifyAccessToken, allowRoles("nurse"), assignedWardPatient)
module.exports = router