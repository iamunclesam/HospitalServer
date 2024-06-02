const { signAccessToken, signRefreshToken } = require("../../middlewares/auth");
const Admin = require("../admin/adminModel");
const Doctor = require("./doctorModel");
const createHttpError = require("http-errors");

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
    const { id } = req.param;
    const doctor = await Doctor.findById(id);
    res.status(200).Json(doctor);
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



module.exports = {
  getAllDoctors,
  getDoctorByEmail,
  getDoctorById,
  createDoctor,
  updateDoctor,
  doctorLogin,
};
