const createHttpError = require("http-errors");
const Admin = require("../admin/adminModel");
const Doctor = require("../doctor/doctorModel");
const Nurse = require("../nurse/nurseModel");
const { signAccessToken, signRefreshToken } = require("../../middlewares/auth");
const bcrypt = require('bcryptjs')

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user;
    let userRole;

    // Check Admin collection
    user = await Admin.findOne({ email });
    if (user) {
      userRole = 'admin';
    } else {
      // Check Doctor collection
      user = await Doctor.findOne({ email });
      if (user) {
        userRole = 'doctor';
      } else {
        // Check Nurse collection
        user = await Nurse.findOne({ email });
        if (user) {
          userRole = 'nurse';
        }
      }
    }

    if (!user) throw createHttpError.NotFound('User not registered');

    // Log the found user and their role
    console.log('Found user:', user.email, 'Role:', userRole);

    // Manually hash the input password and compare it with the stored hash
    const manualHashComparison = await bcrypt.compare(password, user.password);

    // Log the result of manual hash comparison
    console.log('Manual password hash comparison result:', manualHashComparison);

    if (!manualHashComparison) throw createHttpError.Unauthorized('Email or password not valid');

    const accessToken = await signAccessToken(user._id, userRole);
    const refreshToken = await signRefreshToken(user._id);
    res.send({ accessToken, refreshToken, role: userRole });
  } catch (error) {
    if (error.isJoi === true) return next(createHttpError.BadRequest('Invalid Email/Password'));
    next(error);
  }
};

module.exports = {
  loginUser,
};
