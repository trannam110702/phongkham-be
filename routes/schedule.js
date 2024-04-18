const express = require("express");
const pool = require("../model/index");

const router = express.Router();

router.get("/getall", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM schedule");
    client.release();
    res.send(result.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/add", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, phonenumber, examDate } = req.body;
    const result = await client.query(
      "INSERT INTO schedule (name, phonenumber, date, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, phonenumber, examDate, "new"]
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
    const result = await client.query("DELETE FROM schedule WHERE code = $1", [req.body.code]);
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
    const { code, status } = req.body;
    const result = await client.query(
      "UPDATE schedule SET status = $2 WHERE code = $1 RETURNING *",
      [code, status]
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
    const result = await client.query("SELECT * FROM schedule WHERE code = $1", [req.params.code]);
    client.release();
    res.send(result.rows[0]);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
