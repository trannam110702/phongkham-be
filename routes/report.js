const express = require("express");
const pool = require("../model/index");

const router = express.Router();

// Route to get revenue by services or medicines filtered by date range and optional medicine/service code
router.get("/revenue", async (req, res) => {
  try {
    const { fromDate, toDate, medicineCode, serviceCode } = req.query;
    let query;
    let queryParams;

    const client = await pool.connect();

    const dateRange = Math.abs(new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24);

    if (dateRange < 30) {
      // For date ranges less than 30 days, return revenue for each day
      if (medicineCode) {
        // Calculate revenue by medicines for each day
        query = `
          SELECT d.date, 
                 COALESCE(SUM(im.price * im.quantity), 0) AS medicine_revenue,
                 COALESCE(SUM(i.service_fee), 0) AS service_revenue
          FROM generate_series($1::date, $2::date, '1 day') d(date)
          LEFT JOIN invoice i ON d.date = DATE(i.date)
          LEFT JOIN invoice_medicine im ON i.code = im.invoice AND im.medicine = $3
          GROUP BY d.date
          ORDER BY d.date
        `;
        queryParams = [fromDate, toDate, medicineCode];
      } else if (serviceCode) {
        // Calculate revenue by services for each day
        query = `
          SELECT d.date, 
                 COALESCE(SUM(im.price * im.quantity), 0) AS medicine_revenue,
                 COALESCE(SUM(i.service_fee), 0) AS service_revenue
          FROM generate_series($1::date, $2::date, '1 day') d(date)
          LEFT JOIN invoice i ON d.date = DATE(i.date)
          LEFT JOIN exam_service es ON i.exam = es.exam AND es.service = $3
          LEFT JOIN invoice_medicine im ON i.code = im.invoice
          GROUP BY d.date
          ORDER BY d.date
        `;
        queryParams = [fromDate, toDate, serviceCode];
      } else {
        // Calculate total revenue for each day
        query = `
          SELECT d.date, 
                 COALESCE(SUM(im.price * im.quantity), 0) AS medicine_revenue,
                 COALESCE(SUM(i.service_fee), 0) AS service_revenue
          FROM generate_series($1::date, $2::date, '1 day') d(date)
          LEFT JOIN invoice i ON d.date = DATE(i.date)
          LEFT JOIN invoice_medicine im ON i.code = im.invoice
          GROUP BY d.date
          ORDER BY d.date
        `;
        queryParams = [fromDate, toDate];
      }
    } else {
      // For date ranges greater than or equal to 30 days, return revenue aggregated by month
      if (medicineCode) {
        // Calculate revenue by medicines aggregated by month
        query = `
          SELECT TO_CHAR(d.month, 'YYYY-MM') AS month, 
                 COALESCE(SUM(im.price * im.quantity), 0) AS medicine_revenue,
                 COALESCE(SUM(i.service_fee), 0) AS service_revenue
          FROM (
            SELECT generate_series(DATE_TRUNC('MONTH', $1::date), DATE_TRUNC('MONTH', $2::date) + INTERVAL '1 MONTH' - INTERVAL '1 day', '1 month') AS month
          ) d
          LEFT JOIN invoice i ON DATE_TRUNC('MONTH', i.date) = d.month
          LEFT JOIN invoice_medicine im ON i.code = im.invoice AND im.medicine = $3
          GROUP BY d.month
          ORDER BY d.month
        `;
        queryParams = [fromDate, toDate, medicineCode];
      } else if (serviceCode) {
        // Calculate revenue by services aggregated by month
        query = `
          SELECT TO_CHAR(d.month, 'YYYY-MM') AS month, 
                 COALESCE(SUM(im.price * im.quantity), 0) AS medicine_revenue,
                 COALESCE(SUM(i.service_fee), 0) AS service_revenue
          FROM (
            SELECT generate_series(DATE_TRUNC('MONTH', $1::date), DATE_TRUNC('MONTH', $2::date) + INTERVAL '1 MONTH' - INTERVAL '1 day', '1 month') AS month
          ) d
          LEFT JOIN invoice i ON DATE_TRUNC('MONTH', i.date) = d.month
          LEFT JOIN exam_service es ON i.exam = es.exam AND es.service = $3
          LEFT JOIN invoice_medicine im ON i.code = im.invoice
          GROUP BY d.month
          ORDER BY d.month
        `;
        queryParams = [fromDate, toDate, serviceCode];
      } else {
        // Calculate total revenue aggregated by month
        query = `
          SELECT TO_CHAR(d.month, 'YYYY-MM') AS month, 
                 COALESCE(SUM(im.price * im.quantity), 0) AS medicine_revenue,
                 COALESCE(SUM(i.service_fee), 0) AS service_revenue
          FROM (
            SELECT generate_series(DATE_TRUNC('MONTH', $1::date), DATE_TRUNC('MONTH', $2::date) + INTERVAL '1 MONTH' - INTERVAL '1 day', '1 month') AS month
          ) d
          LEFT JOIN invoice i ON DATE_TRUNC('MONTH', i.date) = d.month
          LEFT JOIN invoice_medicine im ON i.code = im.invoice
          GROUP BY d.month
          ORDER BY d.month
        `;
        queryParams = [fromDate, toDate];
      }
    }

    // Execute the query with appropriate parameters
    const result = await client.query(query, queryParams);

    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching revenue:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/serviceQuantity", async (req, res) => {
  try {
    const { fromDate, toDate, serviceCode } = req.query;

    const client = await pool.connect();

    let query;
    let queryParams;

    if (serviceCode) {
      // If serviceCode is specified, count the quantity of exams containing that service within the specified date range
      query = `
      SELECT d.date, COALESCE(COUNT(CASE WHEN es.service = $3 THEN 1 END), 0) AS quantity
      FROM generate_series($1::date, $2::date, '1 day') AS d(date)
      LEFT JOIN (
          SELECT examDate, code
          FROM exam
      ) AS e ON d.date = e.examDate
      LEFT JOIN exam_service es ON e.code = es.exam
      GROUP BY d.date
      ORDER BY d.date;
        `;
      queryParams = [fromDate, toDate, serviceCode];
    } else {
      // If serviceCode is not specified, calculate the total service fee of all exams for each day within the specified date range
      query = `
      SELECT d.date, COUNT(es.service) AS quantity
      FROM generate_series($1::date, $2::date, '1 day') AS d(date)
      LEFT JOIN (
          SELECT examDate, code
          FROM exam
      ) AS e ON d.date = e.examDate
      LEFT JOIN exam_service es ON e.code = es.exam
      GROUP BY d.date
      ORDER BY d.date;
        `;
      queryParams = [fromDate, toDate];
    }

    const result = await client.query(query, queryParams);

    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching exam quantity:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

module.exports = router;
