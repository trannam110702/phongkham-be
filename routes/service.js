var express = require("express");
var mongoose = require("mongoose");
var { serviceSchema } = require("../model/schemas");
var { uri } = require("../model");

var router = express.Router();
router.get("/", async function (req, res, next) {
  res.send("hi");
});
router.get("/getall", async (req, res) => {
  mongoose.connect(uri);
  var Service = mongoose.model("service", serviceSchema);
  var dbres = await Service.find({}).exec();
  res.send(dbres);
});
router.post("/add", async (req, res) => {
  mongoose.connect(uri);
  var Service = mongoose.model("service", serviceSchema);
  var newService = new Service(req.body);
  console.log(req.body);
  newService
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
  var Service = mongoose.model("service", serviceSchema);
  var dbres = await Service.deleteOne({ _id: req.body._id });
  res.send(dbres);
});
router.post("/update", async (req, res) => {
  mongoose.connect(uri);
  var Service = mongoose.model("service", serviceSchema);
  var id = req.body._id;
  delete req.body._id;
  Service.findByIdAndUpdate(id, req.body)
    .exec()
    .then((dbres) => {
      res.send(dbres);
    })
    .catch((e) => {
      res.send(e);
    });
});

module.exports = router;
