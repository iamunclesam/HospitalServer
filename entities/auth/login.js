const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const Admin = require("../admin/adminModel"); // Adjust the path as necessary
const Doctor = require("../doctor/doctorModel"); // Adjust the path as necessary
const Nurse = require("../nurse/nurseModel"); // Adjust the path as necessary
const { signAccessToken, signRefreshToken } = require("../../middlewares/auth"); // Adjust the path as necessary

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user;
    let userRole;

    // Check Admin collection
    user = await Admin.findOne({ email });
    if (user) {
      userRole = "admin";
    } else {
      // Check Doctor collection
      user = await Doctor.findOne({ email });
      if (user) {
        userRole = "doctor";
      } else {
        // Check Nurse collection
        user = await Nurse.findOne({ email });
        if (user) {
          userRole = "nurse";
        }
      }
    }

    if (!user) throw createHttpError.NotFound("User not registered");

    const isMatch = await user.isValidPassword(password);

    if (!isMatch)
      throw createHttpError.Unauthorized("Email or password not valid");

    const accessToken = await signAccessToken(user._id, userRole);
    const refreshToken = await signRefreshToken(user._id);
    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi === true)
      return next(createHttpError.BadRequest("Invalid Email/Password"));
    next(error);
  }
};

module.exports = {
  loginUser,
};
