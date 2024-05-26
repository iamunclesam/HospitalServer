const mongoose = require("mongoose")

const StaffSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    department: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    
    age: {
        type: Number,
        required: true
    },

    yearsOfExperience: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female"],
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phone: {
        type: Number,
        required: true
    },

    address: {
        type: String,
        required: true
    }
})

const Doctor = StaffSchema.model("Doctor", DoctorSchema)

module.exports = Doctor