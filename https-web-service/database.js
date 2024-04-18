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

// Function to check and transfer data
async function checkAndTransferData() {
    const db = await connectToDatabase();
    const targetCollection = db.collection('movies');
    const count = await targetCollection.countDocuments();

    if (count === 0) {
        console.log("No movies found in 'final_project', transferring from 'sample_mflix'...");
        const sourceDb = client.db("sample_mflix");
        const sourceCollection = sourceDb.collection('movies');
        const moviesToTransfer = await sourceCollection.find().limit(100).toArray();
        if (moviesToTransfer.length > 0) {
            await targetCollection.insertMany(moviesToTransfer);
            console.log(`${moviesToTransfer.length} movies transferred to 'final_project' database`);
        }
    } else {
        console.log("Movies collection already has data. No data transferred.");
    }
}

// // Connect to the database and export the client
// connect().catch(console.error);

// Export the MongoClient to use it in other parts of your app
module.exports = {
    connectToDatabase,
    checkAndTransferData
};