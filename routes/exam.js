var express = require("express");
var mongoose = require("mongoose");
var { examSchema } = require("../model/schemas");
var { uri } = require("../model");

var router = express.Router();
router.get("/", async function (req, res, next) {
  res.send("hi");
});
router.get("/getall", async (req, res) => {
  mongoose.connect(uri);
  var Exam = mongoose.model("exam", examSchema);
  var dbres = await Exam.find({}).exec();
  res.send(dbres);
});
router.post("/add", async (req, res) => {
  mongoose.connect(uri);
  var Exam = mongoose.model("exam", examSchema);
  var newExam = new Exam(JSON.parse(req.body.str));
  console.log(newExam);
  newExam
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
  var Exam = mongoose.model("exam", examSchema);
  var dbres = await Exam.deleteOne({ _id: req.body._id });
  res.send(dbres);
});
router.post("/update", async (req, res) => {
  mongoose.connect(uri);
  var Exam = mongoose.model("exam", examSchema);
  var obj = JSON.parse(req.body.str);
  console.log(obj);
  var id = obj._id;
  delete obj._id;
  Exam.findByIdAndUpdate(id, obj)
    .exec()
    .then((dbres) => {
      res.send(dbres);
    })
    .catch((e) => {
      res.send(e);
    });
});

module.exports = router;
