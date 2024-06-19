const createHttpError = require("http-errors");
const Admin = require("../admin/adminModel");
const Doctor = require("../doctor/doctorModel");
const Nurse = require("../nurse/nurseModel");
const { signAccessToken, signRefreshToken } = require("../../middlewares/auth");

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = await req.body;

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

    if (!user) {
      console.log('User not registered');
      throw createHttpError.NotFound('User not registered');
    }

    console.log(`User found: ${user.email} with role: ${userRole}`);

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      console.log('Password does not match');
      throw createHttpError.Unauthorized('Email or password not valid');
    }

    const accessToken = await signAccessToken(user._id, userRole);
    const refreshToken = await signRefreshToken(user._id);
    res.send({ accessToken, refreshToken, role: userRole });
  } catch (error) {
    if (error.isJoi === true) {
      return next(createHttpError.BadRequest('Invalid Email/Password'));
    }
    next(error);
  }
};


module.exports = {
  loginUser,
};
