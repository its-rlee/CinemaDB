const { MongoClient } = require("mongodb");
const logger = require("./logger");

const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_NAME } = require("./settings");

const mongoUri = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_NAME}.3t4shww.mongodb.net/`


const client = new MongoClient(mongoUri);

let db = null;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db("final_project");
        logger.info("Connected successfully to MongoDB");
        return db;
    } catch (error) {
        logger.error('Connection to MongoDB failed:', error);
        throw new Error('Failed to connect to MongoDB');
    }
}

// // Connect to the database and export the client
// connect().catch(console.error);

// Export the MongoClient to use it in other parts of your app
module.exports = connectToDatabase;