const express = require("express");
const cors = require("cors");
const { Client } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "civicflow_dev",
  password: "Orbiterofsteel279!",
  port: 5432,
});

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    app.get("/permits", async (req, res) => {
      try {
        const result = await client.query(
          "SELECT * FROM permits ORDER BY created_at DESC"
        );
        res.json(result.rows);
      } catch (err) {
        console.error("GET /permits error:", err);
        res.status(500).json({ error: "Failed to fetch permits" });
      }
    });

    app.post("/permits", async (req, res) => {
      try {
        const {
          applicant_name,
          municipality,
          business_type,
          permit_type,
          status,
          progress,
          due_date,
          current_department,
          missing_items,
        } = req.body;

        const result = await client.query(
          `INSERT INTO permits
          (applicant_name, municipality, business_type, permit_type, status, progress, due_date, current_department, missing_items)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            applicant_name,
            municipality,
            business_type,
            permit_type,
            status || "not_started",
            progress || 0,
            due_date || null,
            current_department || null,
            missing_items || [],
          ]
        );

        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error("POST /permits error:", err);
        res.status(500).json({ error: "Failed to create permit" });
      }
    });

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
}

startServer();