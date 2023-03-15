var mongoose = require("mongoose");
const patientSchema = new mongoose.Schema(
  {
    name: String,
    cccd: String,
    phonenumber: String,
    email: String,
    address: String,
  },
  { collection: "patient" }
);
const medicoSchema = new mongoose.Schema(
  {
    name: String,
    cccd: String,
    phonenumber: String,
    email: String,
    address: String,
  },
  { collection: "medico" }
);
const medicineSchema = new mongoose.Schema(
  {
    name: String,
    code: String,
    origin: String,
    dueDate: String,
    unit: String,
  },
  { collection: "medicine" }
);
const serviceSchema = new mongoose.Schema(
  {
    name: String,
    code: String,
    price: Number,
    description: String,
  },
  { collection: "service" }
);
const examSchema = new mongoose.Schema(
  {
    patient: String,
    medico: String,
    service: String,
    examDate: String,
    description: String,
    medicine: [String],
  },
  { collection: "exam" }
);
module.exports = {
  patientSchema,
  medicoSchema,
  medicineSchema,
  serviceSchema,
  examSchema,
};
