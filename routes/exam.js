var express = require("express");
var pool = require("../model/index");

var router = express.Router();

router.get("/", async function (req, res, next) {
  res.send("hi");
});

router.get("/getall", async (req, res) => {
  try {
    const client = await pool.connect();

    // Query to select all exams with associated exam_medicine data
    const query = `
      SELECT e.*, em.medicine, em.quantity
      FROM exam e
      LEFT JOIN exam_medicine em ON e.code = em.exam
    `;

    // Execute the query
    const result = await client.query(query);

    // Process the result and organize exam data along with exam_medicine data
    const exams = {};
    result.rows.forEach((row) => {
      const { code, medicine, quantity, ...examData } = row;
      if (!exams[code]) {
        exams[code] = {
          ...examData,
          medicines: [],
        };
      }
      if (medicine) {
        exams[code].medicines.push({ medicine, quantity });
      }
    });

    // Convert object of exams to array
    const examArray = Object.values(exams);

    client.release();
    res.send(examArray);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/add", async (req, res) => {
  const client = await pool.connect();
  try {
    // Extract exam data from request body
    const { patient, medico, service, examDate, description, medicines } = req.body;

    // Start a transaction
    await client.query("BEGIN");

    // Insert into the exam table
    const examQuery =
      "INSERT INTO exam (patient, medico, service, examDate, description) VALUES ($1, $2, $3, $4, $5) RETURNING code";
    const examValues = [patient, medico, service, examDate, description];
    const examResult = await client.query(examQuery, examValues);
    const examCode = examResult.rows[0].code;

    // Insert into the exam_medicine table for each medicine provided
    const insertMedicineQuery =
      "INSERT INTO exam_medicine (exam, medicine, quantity) VALUES ($1, $2, $3)";
    for (const { medicine, quantity } of medicines) {
      await client.query(insertMedicineQuery, [examCode, medicine, quantity]);
    }

    // Commit the transaction
    await client.query("COMMIT");

    res.send({ success: true, message: "Exam added successfully" });
  } catch (error) {
    // Rollback the transaction on error
    await client.query("ROLLBACK");
    console.error("Error adding exam", error);
    res.status(500).send("Internal server error");
  } finally {
    // Release the client
    client.release();
  }
});

router.post("/delete", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM exam WHERE id = $1", [req.body.id]);
    client.release();
    res.send(result.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/update", async (req, res) => {
  const client = await pool.connect();
  try {
    const { code, patient, medico, service, examDate, description, medicines } = req.body;

    // Start a transaction
    await client.query("BEGIN");

    // Update the exam table
    const updateExamQuery =
      "UPDATE exam SET patient = $2, medico = $3, service = $4, examDate = $5, description = $6 WHERE code = $1 RETURNING *";
    const updateExamValues = [code, patient, medico, service, examDate, description];
    const updatedExamResult = await client.query(updateExamQuery, updateExamValues);
    const updatedExam = updatedExamResult.rows[0];

    // Delete existing exam_medicine records for this exam
    const deleteExamMedicineQuery = "DELETE FROM exam_medicine WHERE exam = $1";
    await client.query(deleteExamMedicineQuery, [code]);

    // Insert updated exam_medicine records
    const insertExamMedicineQuery =
      "INSERT INTO exam_medicine (exam, medicine, quantity) VALUES ($1, $2, $3)";
    for (const { medicine, quantity } of medicines) {
      await client.query(insertExamMedicineQuery, [code, medicine, quantity]);
    }

    // Commit the transaction
    await client.query("COMMIT");

    res.send({ success: true, message: "Exam updated successfully", exam: updatedExam });
  } catch (error) {
    // Rollback the transaction on error
    await client.query("ROLLBACK");
    console.error("Error updating exam", error);
    res.status(500).send("Internal server error");
  } finally {
    // Release the client
    client.release();
  }
});

module.exports = router;
