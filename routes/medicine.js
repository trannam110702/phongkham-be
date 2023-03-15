var express = require("express");
var mongoose = require("mongoose");
var { medicineSchema } = require("../model/schemas");
var { uri } = require("../model");

var router = express.Router();
router.get("/", async function (req, res, next) {
  res.send("hi");
});
router.get("/getall", async (req, res) => {
  mongoose.connect(uri);
  var Medicine = mongoose.model("medicine", medicineSchema);
  var dbres = await Medicine.find({}).exec();
  res.send(dbres);
});
router.post("/add", async (req, res) => {
  mongoose.connect(uri);
  var Medicine = mongoose.model("medicine", medicineSchema);
  var newMedicine = new Medicine(req.body);
  console.log(req.body);
  newMedicine
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
  var Medicine = mongoose.model("medicine", medicineSchema);
  var dbres = await Medicine.deleteOne({ _id: req.body.key });
  res.send(dbres);
});
router.post("/update", async (req, res) => {
  mongoose.connect(uri);
  var Medicine = mongoose.model("medicine", medicineSchema);
  var id = req.body._id;
  delete req.body._id;
  Medicine.findByIdAndUpdate(id, req.body)
    .exec()
    .then((dbres) => {
      res.send(dbres);
    })
    .catch((e) => {
      res.send(e);
    });
});

module.exports = router;
