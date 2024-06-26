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
    const result = await client.query("SELECT * FROM medicine");
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
    const { name, origin, dueDate, unit, price } = req.body;
    console.log(req.body);

    const [day, month, year] = dueDate.split("/");
    const formattedDueDate = `${year}-${month}-${day}`;

    const result = await client.query(
      "INSERT INTO medicine (name, origin, dueDate, unit, price) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, origin, formattedDueDate, unit, price]
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
    const result = await client.query("DELETE FROM medicine WHERE code = $1", [req.body.code]);
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
    const { code, name, origin, dueDate, unit, price } = req.body;
    const result = await client.query(
      "UPDATE medicine SET name = $2, origin = $3, dueDate = $4, unit = $5, price = $6 WHERE code = $1 RETURNING *",
      [code, name, origin, dueDate, unit, price]
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
    const result = await client.query("SELECT * FROM medicine WHERE code = $1", [req.params.code]);
    client.release();
    res.send(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
