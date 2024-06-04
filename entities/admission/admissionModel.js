const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdmissionSchema = new Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },

  admissionDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dischargeDate: {
    type: Date
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  reasonForAdmission: {
    type: String,
    required: true
  },
  currentStatus: {
    type: String,
    enum: ['admitted', 'discharged', 'transferred'],
    default: 'admitted'
  },
  roomNumber: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },

  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  ward: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  bedNumber: {
    type: Number,
    required: true
  }

});

const Admission = mongoose.model('Admission', AdmissionSchema);

module.exports = Admission;
