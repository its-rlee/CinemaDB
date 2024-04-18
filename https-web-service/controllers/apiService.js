const axios = require('axios');
const logger = require('../logger')

// Function to fetch movie data from the API
async function fetchMovieDataFromAPI(title) {
    try {
        const response = await axios.get(`https://search.imdbot.workers.dev/`, { params: { q: title } });
        if (response.data && response.data.description && response.data.description.length > 0) {
            return response.data.description;
        } else {
            logger.error('No movies found or invalid API structure:', response.data);
            return null; // No movies found or data structure is not as expected
        }
    } catch (error) {
        logger.error('Failed to fetch from API:', error.message, 'Status:', error.response?.status);
        return null; // Returning null to indicate an error situation
    }
}

module.exports = {
    fetchMovieDataFromAPI
};
