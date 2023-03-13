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
module.exports = { patientSchema };
