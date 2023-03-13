var express = require("express");
var mongoose = require("mongoose");
var { patientSchema } = require("../model/schemas");
var { uri } = require("../model");

var router = express.Router();
router.get("/", async function (req, res, next) {
  res.send("hi");
});
router.get("/getall", async (req, res) => {
  mongoose.connect(uri);
  var Patient = mongoose.model("patient", patientSchema);
  var dbres = await Patient.find({}).exec();
  res.send(dbres);
});
module.exports = router;
