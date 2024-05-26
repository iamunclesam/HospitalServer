const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the prescription schema
const prescriptionSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  medications: [
    {
      name: {
        type: String,
        required: true
      },
      dosage: {
        type: String,
        required: true
      },
      frequency: {
        type: String,
        required: true
      }
    }
  ],
  instructions: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
