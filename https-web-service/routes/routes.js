const express = require('express')
const router = express.Router()
const logger = require('../logger')

const { ObjectId } = require('mongodb');

const { fetchMovieDataFromAPI } = require('../controllers/apiService');
const { connectToDatabase } = require('../database');




// Get client's device type & IP address    
router.use((req, res, next) => {
    req.userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    req.deviceType = req.header('User-Agent')
    next()
})


router.get('/movies', async (req, res) => {
    try {
        const db = await connectToDatabase()
        const collection = db.collection('movies');

        let query = {};

        // Check for a minimum rating filter
        if (req.query.minRating) {
            const minRating = parseFloat(req.query.minRating);
            if (!isNaN(minRating)) {
                query['imdb.rating'] = { $gte: minRating, $lte: 10 };
            }
        }

        const movies = await collection.find(query).toArray();

        logger.info('Movies fetched successfully')
        res.json({ movies: movies, userIp: req.userIp, deviceType: req.deviceType })
    } catch (error) {
        logger.error('Error fetching movies:', error)
        res.status(500).json({ error: error.toString(), userIp: req.userIp, deviceType: req.deviceType })
    }
});

router.get('/movies/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('movies');

        // Attempt to convert the ID from the path parameter into an ObjectId
        let movieId;
        try {
            movieId = new ObjectId(req.params.id);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid ID format', userIp: req.userIp, deviceType: req.deviceType });
        }

        // Query the database for a single movie by its ObjectId
        const movie = await collection.findOne({ _id: movieId });

        if (movie) {
            logger.info(`Movie with ID ${req.params.id} fetched successfully`);
            res.json({ movie: movie, userIp: req.userIp, deviceType: req.deviceType });
        } else {
            logger.info(`Movie with ID ${req.params.id} not found`);
            res.status(404).send('Movie not found');
        }
    } catch (error) {
        logger.error('Error fetching movie by ID:', error);
        res.status(500).json({ error: error.toString(), userIp: req.userIp, deviceType: req.deviceType });
    }
});

router.patch('/movies/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('movies');

        const result = await collection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
        if (result.modifiedCount === 0) {
            return res.status(404).send('Movie with the specified ID not found and/or not updated');
        }
        res.send('Movie updated successfully');
    } catch (error) {
        logger.error('Error updating movie:', error);
        res.status(500).send('Error updating movie');
    }
});

router.delete('/movies/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('movies');

        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).send('Movie with the specified ID not found and/or not deleted');
        }
        res.send('Movie deleted successfully');
    } catch (error) {
        logger.error('Error deleting movie:', error);
        res.status(500).send('Error deleting movie');
    }
});

router.post('/movies', async (req, res) => {
    const { title } = req.body;
    const apiData = await fetchMovieDataFromAPI(title);

    const db = await connectToDatabase();
    const collection = db.collection('movies');

    // Merge API data with user input data
    const movieData = { ...req.body, ...apiData };

    try {
        await collection.insertOne(movieData);
        res.status(201).send('Movie added successfully');
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

module.exports = router;