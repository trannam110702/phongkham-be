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

    // Query to select all invoices along with associated invoice_medicine records
    const query = `
      SELECT i.code, i.exam, i.service_fee, i.date,
             p_medico.code AS medico_code, p_medico.name AS medico_name,
             p_patient.code AS patient_code, p_patient.name AS patient_name,
             im.medicine, im.quantity, im.price
      FROM invoice i
      LEFT JOIN invoice_medicine im ON i.code = im.invoice
      LEFT JOIN exam e ON i.exam = e.code
      LEFT JOIN people p_medico ON e.medico = p_medico.code
      LEFT JOIN people p_patient ON e.patient = p_patient.code
    `;

    // Execute the query
    const result = await client.query(query);

    // Organize the result into an array of invoices with associated invoice_medicine
    const invoices = {};
    result.rows.forEach((row) => {
      const {
        code,
        exam,
        service_fee,
        date,
        medico_code,
        medico_name,
        patient_code,
        patient_name,
        medicine,
        quantity,
        price,
      } = row;
      if (!invoices[code]) {
        invoices[code] = {
          code,
          exam,
          service_fee,
          date,
          medico_code,
          medico_name,
          patient_code,
          patient_name,
          invoiceMedicine: [],
        };
      }
      if (medicine) {
        invoices[code].invoiceMedicine.push({ medicine, quantity, price });
      }
    });

    // Convert the object of invoices to an array
    const invoiceArray = Object.values(invoices);

    client.release();
    res.send(invoiceArray);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/create", async (req, res) => {
  const client = await pool.connect();
  try {
    const { examCode, date } = req.body;

    // Start a transaction
    await client.query("BEGIN");

    // Calculate the total service fee for the exam
    const serviceFeeQuery = `
      SELECT SUM(s.price) AS total_price
      FROM exam_service es
      INNER JOIN service s ON es.service = s.code
      WHERE es.exam = $1
    `;
    const serviceFeeResult = await client.query(serviceFeeQuery, [examCode]);
    const totalServicePrice = serviceFeeResult.rows[0].total_price;

    // Insert into the invoice table
    const invoiceQuery =
      "INSERT INTO invoice (exam, service_fee, date) VALUES ($1, $2, $3) RETURNING code";
    const invoiceValues = [examCode, totalServicePrice, date];
    const invoiceResult = await client.query(invoiceQuery, invoiceValues);
    const invoiceCode = invoiceResult.rows[0].code;

    // Include invoice medicines based on exam medicines
    const insertInvoiceMedicinesQuery = `
      INSERT INTO invoice_medicine (invoice, medicine, quantity, price)
      SELECT $1, em.medicine, em.quantity, m.price * em.quantity
      FROM exam_medicine em
      INNER JOIN medicine m ON em.medicine = m.code
      WHERE em.exam = $2
    `;
    await client.query(insertInvoiceMedicinesQuery, [invoiceCode, examCode]);

    // Commit the transaction
    await client.query("COMMIT");

    res.send({ success: true, message: "Invoice created successfully", invoiceCode });
  } catch (error) {
    // Rollback the transaction on error
    await client.query("ROLLBACK");
    console.error("Error creating invoice", error);
    res.status(500).send("Internal server error");
  } finally {
    // Release the client
    client.release();
  }
});

router.post("/delete", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM invoice WHERE code = $1", [req.body.code]);
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
    const { code, exam, service_fee, date, invoiceMedicine } = req.body;

    // Start a transaction
    await client.query("BEGIN");

    // Update the invoice table
    const updateInvoiceQuery =
      "UPDATE invoice SET exam = $2, service_fee = $3, date = $4 WHERE code = $1 RETURNING *";
    const updateInvoiceValues = [code, exam, service_fee, date];
    const updatedInvoiceResult = await client.query(updateInvoiceQuery, updateInvoiceValues);
    const updatedInvoice = updatedInvoiceResult.rows[0];

    // Delete existing invoice_medicine records for this invoice
    const deleteInvoiceMedicineQuery = "DELETE FROM invoice_medicine WHERE invoice = $1";
    await client.query(deleteInvoiceMedicineQuery, [code]);

    // Insert updated invoice_medicine records
    const insertInvoiceMedicineQuery =
      "INSERT INTO invoice_medicine (invoice, medicine, quantity, price) VALUES ($1, $2, $3, $4)";
    for (const { medicine, quantity, price } of invoiceMedicine) {
      await client.query(insertInvoiceMedicineQuery, [code, medicine, quantity, price]);
    }

    // Commit the transaction
    await client.query("COMMIT");

    res.send({ success: true, message: "Invoice updated successfully", invoice: updatedInvoice });
  } catch (error) {
    // Rollback the transaction on error
    await client.query("ROLLBACK");
    console.error("Error updating invoice", error);
    res.status(500).send("Internal server error");
  } finally {
    // Release the client
    client.release();
  }
});

router.get("/:code", async (req, res) => {
  try {
    const client = await pool.connect();
    const code = req.params.code;

    // Query to select invoice details along with associated invoice_medicine records
    const query = `
        SELECT i.*, im.medicine, im.quantity, im.price
        FROM invoice i
        LEFT JOIN invoice_medicine im ON i.code = im.invoice
        WHERE i.code = $1
      `;

    // Execute the query
    const result = await client.query(query, [code]);

    // Process the result to organize invoice data along with invoice_medicine data
    let invoice = null;
    if (result.rows.length > 0) {
      invoice = {
        code: result.rows[0].code,
        exam: result.rows[0].exam,
        service_fee: result.rows[0].service_fee,
        date: result.rows[0].date,
        invoiceMedicine: result.rows
          .filter((row) => row.medicine !== null)
          .map((row) => ({
            medicine: row.medicine,
            quantity: row.quantity,
            price: row.price,
          })),
      };
    }

    client.release();
    res.send(invoice);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
