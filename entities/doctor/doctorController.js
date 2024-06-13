const { signAccessToken, signRefreshToken } = require("../../middlewares/auth");
const Admin = require("../admin/adminModel");
const Patient = require("../patient/patientModel");
const Doctor = require("./doctorModel");
const createHttpError = require("http-errors");

/** Go to Admin's Controller to see create doctor */
const createDoctor = async (req, res) => {
  try {
    const result = await req.body;
    const adminId = req.payload._id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
    }
    // Check if the user already exists
    const doesExist = await Doctor.findOne({ email: result.email });
    if (doesExist)
      throw createHttpError.Conflict(`${result.email} is already registered`);

    // Create and save the new user
    const user = new Doctor(result);
    const savedUser = await user.save();

    // Generate tokens
    const accessToken = await signAccessToken(savedUser._id, savedUser.role);
    const refreshToken = await signRefreshToken(savedUser._id);

    // Send tokens in response
    res.status(201).send({ accessToken, refreshToken });
  } catch (error) {
    res.status(400).send(error);
  }
};

const doctorLogin = async (req, res, next) => {
  try {
    // const result = await authSchema.validateAsync(req.body);
    const result = await req.body;

    const user = await Doctor.findOne({ email: result.email });

    if (!user) throw createHttpError.NotFound("User not registered");

    const isMatch = await user.isValidPassword(result.password);

    if (!isMatch)
      throw createHttpError.Unauthorized("Email or password not valid");

    const accessToken = await signAccessToken(user._id, user.role);
    const refreshToken = await signRefreshToken(user._id);
    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi == true)
      return next(createHttpError.BadRequest("Invalid Email/Password"));
    next(error);
  }
};

const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all doctors" });
  }
};

const getDoctorByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });

    // If doctor not found, return a 404 response
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Return the found doctor
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor updated", data: doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**  DOCTOR - PATIENTS */

const updatePatientRecords = async (req, res) => {
  try {
    const { patientId, recordId } = req.params;

    if (!req.payload) {
      return res.status(400).json({ error: "Payload missing from request" });
    }

    const { aud: userId } = req.payload;
    let doctorId = userId;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the specific record by its ID within the currentRecord array
    const record = patient.currentRecord.find((record) =>
      record._id.equals(recordId)
    );
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Ensure the record is assigned to the requesting doctor
    if (!record.assignedDoctor.equals(doctorId)) {
      return res
        .status(403)
        .json({ message: "Access denied: Record not assigned to this doctor" });
    }

    // Update the record with the provided data
    Object.assign(record, req.body);

    // Save the updated patient document
    await patient.save();

    // Re-populate the updated record to include related fields
    const updatedPatient = await Patient.findById(patientId).populate(
      "currentRecord.assignedDoctor"
    );
    const updatedRecord = updatedPatient.currentRecord.find((record) =>
      record._id.equals(recordId)
    );

    res
      .status(200)
      .json({ message: "Patient record updated", data: updatedRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const writePrescription = async (req, res) => {
  // Logic to write a prescription
  try {
    const { patientId, doctorId, recordId } = req.params;
    const { medications, instructions, date } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
    }

    const record = patient.currentRecord.find((record) =>
      record._id.equals(recordId)
    );
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    if (!record.assignedDoctor.equals(doctorId)) {
      res.status(403).json({
        message: "Doctor have no permission to prescribe to this patient",
      });
    }

    // Create a new prescription
    const prescription = new Prescription({
      patient: patientId,
      doctor: doctorId,
      medications,
      instructions,
      date: new Date(),
    });

    // Save the prescription
    await prescription.save();

    // Add the prescription to the patient's current record
    record.prescriptions = record.prescriptions || [];
    record.prescriptions.push(prescription);

    // Save the updated patient record
    await patient.save();

    res
      .status(201)
      .json({ message: "Prescription written successfully", prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTreatmentPlan = async (req, res) => {
  // Logic to create a treatment plan
};

const referPatient = async (req, res) => {
  // Logic to refer a patient
};

const sendMessage = async (req, res) => {
  // Logic to send a message
};

module.exports = {
  getAllDoctors,
  getDoctorByEmail,
  getDoctorById,
  createDoctor,
  updateDoctor,
  doctorLogin,
  updatePatientRecords,
};
