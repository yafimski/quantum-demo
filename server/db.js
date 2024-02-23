require("dotenv").config({ path: `${__dirname}/../.env` });
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URL);

const isProduction = process.env.NODE_ENV === "production";
const ENDPOINT = isProduction
  ? process.env.DEPLOY_SERVICE
  : "http://localhost:5000";

async function connectToDB() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.log(err.stack);
  }
}

function getDB() {
  return client.db("quantum");
}

async function closeConnection() {
  await client.close();
  console.log("Disconnected from the database");
}

module.exports = {
  connectToDB,
  getDB,
  closeConnection,
  ENDPOINT,
};
