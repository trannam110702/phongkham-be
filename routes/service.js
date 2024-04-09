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
    const result = await client.query("SELECT * FROM service");
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
    const { name, price, description } = req.body;
    const result = await client.query(
      "INSERT INTO service (name, price, description) VALUES ($1, $2, $3) RETURNING *",
      [name, price, description]
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
    const result = await client.query("DELETE FROM service WHERE code = $1", [req.body.code]);
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
    const { code, name, price, description } = req.body;
    const result = await client.query(
      "UPDATE service SET name = $2, price = $3, description = $4 WHERE code = $1 RETURNING *",
      [code, name, price, description]
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
    const result = await client.query("SELECT * FROM service WHERE code = $1", [req.params.code]);
    client.release();
    res.send(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
