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
router.post("/add", async (req, res) => {
  mongoose.connect(uri);
  var Patient = mongoose.model("patient", patientSchema);
  var newPatient = new Patient(req.body);
  newPatient
    .save()
    .then((dbres) => {
      res.send(dbres);
    })
    .catch((e) => {
      res.send(e);
    });
});
router.post("/delete", async (req, res) => {
  mongoose.connect(uri);
  var Patient = mongoose.model("patient", patientSchema);
  var dbres = await Patient.deleteOne({ _id: req.body.key });
  res.send(dbres);
});
router.post("/update", async (req, res) => {
  mongoose.connect(uri);
  var Patient = mongoose.model("patient", patientSchema);
  var id = req.body._id;
  delete req.body._id;
  Patient.findByIdAndUpdate(id, req.body)
    .exec()
    .then((dbres) => {
      res.send(dbres);
    })
    .catch((e) => {
      res.send(e);
    });
});

module.exports = router;
