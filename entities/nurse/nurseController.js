const createHttpError = require("http-errors");
const { signAccessToken, signRefreshToken } = require("../../middlewares/auth");
const Admin = require("../admin/adminModel");
const Patient = require("../patient/patientModel");
const Nurse = require("./nurseModel");
const Ward = require("../ward/wardModel");
const Admission = require("../admission/admissionModel");
const MedicalHistory = require("../medicalHistory/medicalHistoryModel");

const createNurse = async (req, res) => {
  try {
    const data = await req.body;
    const adminId = req.payload._id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
    }

    const nurseExist = await Nurse.findOne({ email: data.email });
    if (nurseExist)
      throw createHttpError.Conflict(`${data.email} is already registered`);

    const user = new Nurse(data);
    const savedUser = await user.save();

    // Generate tokens
    const accessToken = await signAccessToken(savedUser._id, savedUser.role);
    const refreshToken = await signRefreshToken(savedUser._id);

    // Send tokens in response
    res.status(201).send({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const nurseLogin = async (req, res, next) => {
  try {
    const data = req.body;
    const user = await Nurse.findOne({email: data.email});

    if(!user) throw createHttpError.NotFound("User not found")

    const isMatch = await user.$isValidPassword(data.password);

    if(!isMatch) throw createHttpError.Unauthorized("Email or password not valid");

    const accessToken = await signAccessToken(user._id, user.role);
    const refreshToken = await signRefreshToken(user._id);
    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi == true)
      return next(createHttpError.BadRequest("Invalid Email/Password"));
    next(error);
  }
}

const getAllNurse = async (req, res) => {
  try {
    const nurse = await Nurse.find({});
    res.status(200).json({ message: "Nurses found", data: nurse });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const getNurseById = async (req, res) => {
  try {
    const { nurseId } = req.params;
    const nurse = await Nurse.findById(nurseId);

    if (!nurse) {
      res.status(404).json({ message: "Nurse not found" });
    }

    res.status(200).json({ data: nurse });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const updateNurse = async (req, res) => {
  try {
    const { nurseId } = req.params;
    const nurse = await Nurse.findByIdAndUpdate(nurseId, req.body);

    if (!nurse) {
      res.status(404).json({ message: "Nurse not found" });
    }

    res.status(200).json({ data: nurse });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const deleteNurse = async (req, res) => {
  try {
    const { nurseId } = req.params;
    const nurse = await Nurse.findByIdAndDelete(nurseId);

    if (!nurse) {
      res.status(404).json({ message: "Nurse not found" });
    }

    res.status(200).json({ data: nurse });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const assignedWardPatient = async (req, res) => {
  try {
    const { wardId } = req.params;
    const nurseId = req.payload.aud;
    const ward = await Ward.findById(wardId);
    const admission = await Admission.findByOne({ ward: wardId });

    if (!ward) {
      res.status(404).json({ message: "Ward not found" });
    }

    if (!admission) {
      res.status(404).json({ message: "Admitted Patient is not in this ward" });
    }

    let assignedNurse = ward.assignedNurses;
    const nurseRecord = assignedNurse.find((record) =>
      record.nurseId.equals(nurseId)
    );

    if (!nurseRecord) {
      res
        .status(400)
        .json({ message: "Nurse does not have access to this ward" });
    }

    res.status(200).json({ message: "Ward Patient found", data: admission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId, wardId } = req.params;
    const nurseId = req.payload.aud;

    const ward = await Ward.findById(wardId).populate(
      "patients.patientId assignedNurses.nurseId"
    );
    if (!ward) return res.status(404).json({ message: "Ward Not Found" });

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient Not Found" });

    const nurseRecord = ward.assignedNurses.find((record) =>
      record.nurseId.equals(nurseId)
    );
    if (!nurseRecord)
      return res
        .status(400)
        .json({ message: "Nurse does not have access to this ward" });

    const patientExist = ward.patients.find((record) =>
      record.patientId.equals(patientId)
    );
    if (!patientExist)
      return res
        .status(400)
        .json({ message: "Patient not found in this ward" });

    const medicalHistory = await MedicalHistory.findOne({
      patient: patientId,
    }).populate("records.assignedDoctor");
    if (!medicalHistory)
      return res
        .status(404)
        .json({ message: "No medical history found for this patient" });

    res.status(200).json({
      message: "Medical history retrieved successfully",
      data: medicalHistory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePatientMedicalRecord = async (req, res) => {
  try {
    const { patientId, wardId } = req.params;
    const nurseId = req.payload._id;
    const { medicalRecordUpdate } = req.body; // Assuming the updated medical record data is in the request body

    // Fetch the ward and check for nurse access
    const ward = await Ward.findById(wardId).populate(
      "patients.patientId assignedNurses.nurseId"
    );
    if (!ward) return res.status(404).json({ message: "Ward Not Found" });

    const nurseRecord = ward.assignedNurses.find((record) =>
      record.nurseId.equals(nurseId)
    );
    if (!nurseRecord)
      return res
        .status(400)
        .json({ message: "Nurse does not have access to this ward" });

    // Check if the patient exists in the ward
    const patientExist = ward.patients.find((record) =>
      record.patientId.equals(patientId)
    );
    if (!patientExist)
      return res
        .status(400)
        .json({ message: "Patient not found in this ward" });

    // Update the patient's medical record
    const medicalHistory = await MedicalHistory.findOneAndUpdate(
      { patient: patientId },
      { $set: { records: medicalRecordUpdate } }, // Adjust the update as necessary
      { new: true }
    ).populate("records.assignedDoctor");

    if (!medicalHistory)
      return res
        .status(404)
        .json({ message: "No medical history found for this patient" });

    res.status(200).json({
      message: "Medical record updated successfully",
      data: medicalHistory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNurse,
  nurseLogin,
  getAllNurse,
  getNurseById,
  updateNurse,
  deleteNurse,

  assignedWardPatient,
  getPatientMedicalHistory,
  updatePatientMedicalRecord
};
