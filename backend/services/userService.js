require('dotenv').config();
const axios = require('axios');
const NodeCache = require('node-cache');
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MongoDB connection string is not defined');
}
const options = {};
let client = null;
let db = null;

async function addUser(params) {
    try {
        client = new MongoClient(uri, options);
        await client.connect();
        db = client.db("user");
        console.log('Database connected');
        const collection = db.collection('AgroBoost');
        console.log(params);
        const result = await collection.insertOne(params);
        return result;
    } catch (error) {
        console.error('Error in addUser:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

async function getUser(params) {
    try {
        client = new MongoClient(uri, options);
        await client.connect();
        db = client.db("user");
        console.log('Database connected');
        const collection = db.collection('AgroBoost');
        console.log(params);
        const result = await collection.findOne(params);
        return result;
    } catch (error) {
        console.error('Error in getUser:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

async function addData(params) {
    try {
        client = new MongoClient(uri, options);
        await client.connect();
        db = client.db("user");
        console.log('Database connected');
        const collection = db.collection('AgroBoost');
        console.log(params);
        
        // Find user by Aadhaar number instead of phone number
        const user = await collection.findOne({ aadhaar: params.aadhaar });
        if (!user) {
            throw new Error('User not found with the provided Aadhaar number');
        }
        
        // Update the user with new information instead of inserting a new document
        const result = await collection.updateOne(
            { aadhaar: params.aadhaar },
            { $set: params }
        );
        
        if (result.modifiedCount === 0) {
            throw new Error('Failed to update user information');
        }
        
        // Return the updated user
        const updatedUser = await collection.findOne({ aadhaar: params.aadhaar });
        return updatedUser;
    } catch (error) {
        console.error('Error in addData:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

module.exports = { addUser, getUser, addData };