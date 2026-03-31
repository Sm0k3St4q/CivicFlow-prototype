const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "civicflow_dev",
  password: "Orbiterofsteel279!",
  port: 5432,
});

async function testConnection() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL!");

    const res = await client.query("SELECT * FROM users;");
    console.log(res.rows);

    await client.end();
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

testConnection();