const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const NurseSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    department: [{
        type: Schema.Types.ObjectId,
        ref: 'department'
    }],
     
    password: {
        type: String,
        required: true,
    },

    yearsOfExperience : {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["nurse"],
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "other"],
        required: true,
      },
    
      email: {
        type: String,
        required: true,
      },
    
      phone: {
        type: Number,
        required: true,
      },
    
      address: {
        type: String,
        required: true,
      },
})

NurseSchema.pre('save', async function (next) {
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
  
NurseSchema.methods.isValidPassword = async function (password) {
  try {
   return await bcrypt.compare(password, this.password)
  } catch (error) {
    throw error
    
  }
  }
  const Nurse = mongoose.model("Nurse", NurseSchema);
  
  module.exports = Nurse;