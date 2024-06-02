// const Doctor = require("../doctor/doctorModel");
const Patient = require("../patient/patientModel");
const { signAccessToken, signRefreshToken } = require("../../middlewares/auth");
const Admin = require("../admin/adminModel");

const createAdminAccount = async (req, res) => {
  try {
    const { name, email, password, gender, phone, role } = req.body;

    // Validate input fields
    if (!name || !email || !password || !gender || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Request Body:", req.body);

    // Check if the user already exists
    const doesExist = await Admin.findOne({ email });
    if (doesExist) {
      console.log("User already exists:", doesExist);
      throw createHttpError.Conflict(`${email} is already registered`);
    }

    // Create and save the new user
    const user = new Admin({ name, email, password, gender, phone, role });
    const savedUser = await user.save();
    console.log("User saved:", savedUser);

    // Generate tokens
    const accessToken = await signAccessToken(savedUser._id, savedUser.role);
    const refreshToken = await signRefreshToken(savedUser._id);

    // Send tokens in response
    res.status(201).send({ accessToken, refreshToken });
  }  catch (error) {
    res.status(400).send(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    // const result = await authSchema.validateAsync(req.body);
    const result = await req.body;

    const user = await Admin.findOne({ email: result.email });

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

const assignPatientToDoctor = async (req, res) => {
  try {
    const { email } = req.body;
    const { doctorId } = req.params;

    // Find the patient by email
    const patient = await Patient.findOne({ email: email });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if there is a current record
    let currentRecord = patient.currentRecord[0];
    if (!currentRecord) {
      // If no current record, create a new one
      currentRecord = {
        assignedDoctor: doctor._id,
        dateOfAdmission: new Date(),
      };
      patient.currentRecord.push(currentRecord);
    } else {
      // If there is a current record, update the assigned doctor
      currentRecord.assignedDoctor = doctor._id;
    }

    // Ensure assignedPatients is initialized as an array
    if (!doctor.assignedPatient) {
      doctor.assignedPatient = [];
    }

    // Check if the patient is already assigned to the doctor
    const doctorRecord = doctor.assignedPatient.find((record) =>
      record.patient.equals(patient._id)
    );
    if (!doctorRecord) {
      doctor.assignedPatient.push({
        patient: patient._id,
        date: new Date(),
      });
    }

    // Save the updates
    await patient.save();
    await doctor.save();

    // Send a success response
    res
      .status(200)
      .json({ message: "Patient assigned to doctor successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  assignPatientToDoctor,
  createAdminAccount,
  adminLogin
};
