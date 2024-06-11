const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wardSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    department : [{
        type : Schema.Types.ObjectId,
        ref : 'department'
    }],
    capacity : {
        type : Number,
        required : true
    },
    currentOccupant : {
        type : String,
        required : true
    },
    patients : [{
       patientId: {
        type : Schema.Types.ObjectId,
        ref : 'patient'
       }
    }],
    staff : [{
        type : Schema.Types.ObjectId,
        ref : 'staff'
    }],
    location : {
        type : String, 
        required : true
    },
    numberOfBeds : {
        type : Number,
        required : true
    },
    assignedNurses: [{
        nurseName: {
            type: String,
            required: true
        },

        nurseId: {
            type: Schema.Types.ObjectId,
            required: true
        }

    }]
})

const Ward = mongoose.model('Ward', wardSchema)
module.exports = Ward