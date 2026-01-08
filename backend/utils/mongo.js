const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // No type assertion needed
const options = {}; // Empty options object

// A variable to hold the singleton client instance
let client = null;
let db = null;

const userdb = async () => {
  if (!uri) {
    throw new Error("Please add your MongoDB URI to .env.local");
  }

  if (!client) {
    client = new MongoClient(uri, options); // Create the MongoClient instance
    await client.connect(); // Establish the connection
    db = client.db("user"); // Connect to the 'database_app' database
  }

  return db;
};

module.exports = { userdb };