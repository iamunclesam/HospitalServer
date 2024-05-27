const mongoose = require('mongoose')
const Schema =  mongoose.Schema

const dptSchema = new Schema({
    name : {
        type : String,
        required : [true, 'Please enter a name']
    },
    description : {
        type : String,
        required : [true, 'Please enter a valid description']
    },
    head : {
        type : String,
        required : true
    },
    staff : {
        type : Schema.Types.ObjectId,
        ref : 'staff'
    },
    doctors : [{
        type : Schema.Types.ObjectId,
        ref : 'doctor'
    }],
    nurses : [{
        type : Schema.Types.ObjectId,
        ref : 'nurse'
    }]
})

const Department = mongoose.model('Department'. dptSchema)
module.exports = Department