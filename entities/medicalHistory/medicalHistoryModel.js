// models/medicalHistoryModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicalHistorySchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  records: [
    {
      assignedDoctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
      dateOfAdmission: { type: Date, required: true },
      symptoms: String,
      diagnosis: String,
      treatmentPlan: String,
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String
        }
      ],
      notes: String,
      dateOfDischarge: { type: Date, required: true },
      ward: Schema.Types.ObjectId
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);
