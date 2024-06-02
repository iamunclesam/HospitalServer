const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const AdminSchema = mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin"],
    required: true,
  },

  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },

  phone: {
    type: Number,
    required: true,
  },

});

AdminSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword;
    next()
  }

  catch(error) {
    next(error)
  }
})

AdminSchema.methods.isValidPassword = async function (password) {
try {
 return await bcrypt.compare(password, this.password)
} catch (error) {
  throw error
  
}
}

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin
