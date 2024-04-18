require('dotenv').config();

const express = require('express')
const https = require('https')
const fs = require('fs')
const cors = require('cors')

const settings = require('./settings')
const routes = require('./routes/routes');
const logger = require('./logger');
const { checkAndTransferData } = require('./database');


// Create Express app
const app = express()

const port = settings.PORT

app.use(express.json())
app.use(cors())

// Mount routes
app.use('/', routes)

// Read the key and certificate files
let options = {};

try {
    options = {
        key: fs.readFileSync('./ssl/key.pem'),
        cert: fs.readFileSync('./ssl/cert.pem')
    };
    logger.info('SSL certificates loaded successfully.');
} catch (error) {
    logger.error('Failed to load SSL certificates:', error);
}

// Function to start the server
const startServer = async () => {
    await checkAndTransferData();
    const server = https.createServer(options, app);
    server.listen(port, () => {
        logger.info(`Server running on https://localhost:${port}`);
    });
};

startServer()