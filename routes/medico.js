var express = require("express");
var mongoose = require("mongoose");
var { medicoSchema } = require("../model/schemas");
var { uri } = require("../model");

var router = express.Router();
router.get("/", async function (req, res, next) {
  res.send("hi");
});
router.get("/getall", async (req, res) => {
  mongoose.connect(uri);
  var Medico = mongoose.model("medico", medicoSchema);
  var dbres = await Medico.find({}).exec();
  res.send(dbres);
});
router.post("/add", async (req, res) => {
  mongoose.connect(uri);
  var Medico = mongoose.model("medico", medicoSchema);
  var newMedico = new Medico(req.body);
  newMedico
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
  var Medico = mongoose.model("medico", medicoSchema);
  var dbres = await Medico.deleteOne({ _id: req.body.key });
  res.send(dbres);
});
router.post("/update", async (req, res) => {
  mongoose.connect(uri);
  var Medico = mongoose.model("medico", medicoSchema);
  var id = req.body._id;
  delete req.body._id;
  Medico.findByIdAndUpdate(id, req.body)
    .exec()
    .then((dbres) => {
      res.send(dbres);
    })
    .catch((e) => {
      res.send(e);
    });
});

module.exports = router;
