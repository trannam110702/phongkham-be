var express = require("express");
var pool = require("../model/index");

var router = express.Router();

router.post("/signin", async (req, res) => {
  try {
    const client = await pool.connect();
    const { username, password } = req.body;

    // Query the account table to find a matching username and password
    const accountQuery = "SELECT * FROM account WHERE username = $1 AND password = $2";
    const accountResult = await client.query(accountQuery, [username, password]);

    if (accountResult.rows.length === 0) {
      // If no matching account found, return an error
      res.status(401).send("Invalid username or password");
      return;
    }

    // Retrieve the associated person's information from the people table
    const personQuery = "SELECT * FROM people WHERE code = $1";
    const personResult = await client.query(personQuery, [accountResult.rows[0].people]);

    const personInfo = personResult.rows[0];

    client.release();
    res.send({ ...personInfo, username, password });
  } catch (error) {
    console.error("Error executing login query", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
