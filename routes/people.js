var express = require("express");
var pool = require("../model/index");

var router = express.Router();

router.get("/", async function (req, res, next) {
  console.log(req);
  res.send("get /");
});

router.get("/getall", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM people");
    client.release();
    res.send(result.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});
router.get("/getbytype", async (req, res) => {
  try {
    const client = await pool.connect();
    const type = req.query.type;
    const result = await client.query("SELECT * FROM people WHERE type = $1", [type]);
    client.release();
    res.send(result.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});
router.post("/add", async (req, res) => {
  try {
    const client = await pool.connect();
    const { cccd, type, name, phonenumber, email, address } = req.body;
    const result = await client.query(
      "INSERT INTO people (cccd, type, name, phonenumber, email, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [cccd, type, name, phonenumber, email, address]
    );
    client.release();
    res.send(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/delete", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM people WHERE code = $1", [req.body.code]);
    client.release();
    res.send(result.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/update", async (req, res) => {
  try {
    const client = await pool.connect();
    const { code, cccd, type, name, phonenumber, email, address } = req.body;
    const result = await client.query(
      "UPDATE people SET cccd = $2, type = $3, name = $4, phonenumber = $5, email = $6, address = $7 WHERE code = $1 RETURNING *",
      [code, cccd, type, name, phonenumber, email, address]
    );
    client.release();
    res.send(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/:code", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM people WHERE code = $1", [req.params.code]);
    client.release();
    res.send(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
