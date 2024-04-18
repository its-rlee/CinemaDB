import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, IconButton, Typography, TextField, MenuItem, FormControl, Select, CircularProgress } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

function MoviesList() {
    const [movies, setMovies] = useState([]);
    const [minRating, setMinRating] = useState('default');

    const [editingMovieId, setEditingMovieId] = useState(null);
    const [tempTitle, setTempTitle] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMovies();
    }, [minRating]);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://localhost:8080/movies?minRating=${minRating}`);
            setMovies(response.data.movies);
        } catch (error) {
            console.error('Failed to fetch movies:', error);
            setError('Failed to fetch movies. Please try again later.');
        }
        setLoading(false);
    };

    const deleteMovie = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://localhost:8080/movies/${id}`);
            fetchMovies(); // Refresh the list after deleting
        } catch (error) {
            console.error('Failed to delete movie:', error);
        }
        setLoading(false);
    };

    // Function to start editing a movie title
    const startEditing = (movie) => {
        setEditingMovieId(movie._id);
        setTempTitle(movie.title); // Initialize temporary title with the current movie title
    };

    // Define handleChange here
    const handleChange = (event) => {
        setMinRating(event.target.value);
    };

    // Function to save the updated movie title
    const saveTitle = async (id) => {
        setLoading(true);
        try {
            await axios.patch(`https://localhost:8080/movies/${id}`, {
                title: tempTitle,
            });
            setEditingMovieId(null); // Exit editing mode
            fetchMovies(); // Refresh the movie list to show the updated title
        } catch (error) {
            setEditingMovieId(null);
            fetchMovies();
            console.error('Failed to save movie title:', error);
        }
        setLoading(false);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Filter by minimum IMDb rating (includes 5-9 and above, default = 0)
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                    value={minRating}
                    onChange={handleChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                >
                    <MenuItem value="default">
                        <em>Default</em>
                    </MenuItem>
                    {[5, 6, 7, 8, 9].map(rating => (
                        <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
            ) : (
                <Box margin={2}>
                    {movies.map(movie => (
                        <Box key={movie._id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <img src={movie.poster} alt={movie.title} style={{ width: '100px', height: '145px', marginRight: '16px' }} />
                            <Box sx={{ flex: 1 }}>
                                {editingMovieId === movie._id ? (
                                    <TextField
                                        size="small"
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        fullWidth
                                    />
                                ) : (
                                    <>
                                        <Typography><strong>Title:</strong> {movie.title}</Typography>
                                        <Typography><strong>Director:</strong> {movie.directors.join(', ')}</Typography>
                                        <Typography><strong>Rating:</strong> {movie.imdb.rating}</Typography>
                                    </>
                                )}
                            </Box>
                            {editingMovieId === movie._id ? (
                                <IconButton onClick={() => saveTitle(movie._id)}><SaveIcon /></IconButton>
                            ) : (
                                <>
                                    <IconButton onClick={() => startEditing(movie)}><EditIcon /><h6>Edit Title</h6></IconButton>
                                    <IconButton onClick={() => deleteMovie(movie._id)}><DeleteIcon /> <h6>Delete Movie</h6> </IconButton>
                                </>
                            )}
                        </Box>
                    ))}
                </Box>)}
        </Box>
    );
}

export default MoviesList;
