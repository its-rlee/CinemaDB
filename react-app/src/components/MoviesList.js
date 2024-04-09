import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, IconButton, Typography, TextField, MenuItem, FormControl, Select } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

function MoviesList() {
    const [movies, setMovies] = useState([]);
    const [minRating, setMinRating] = useState('default');

    const [editingMovieId, setEditingMovieId] = useState(null);
    const [tempTitle, setTempTitle] = useState("");


    useEffect(() => {
        fetchMovies();
    }, [minRating]);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(`https://localhost:8080/movies?minRating=${minRating}`);
            setMovies(response.data.movies);
        } catch (error) {
            console.error('Failed to fetch movies:', error);
        }
    };

    const deleteMovie = async (id) => {
        try {
            await axios.delete(`https://localhost:8080/movies/${id}`);
            fetchMovies(); // Refresh the list after deleting
        } catch (error) {
            console.error('Failed to delete movie:', error);
        }
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
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Filter by minimum rating (5-9 and above):
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
            <Box>
                {movies.map(movie => (
                    <Box key={movie._id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <img src={movie.poster} alt={movie.title} style={{ width: '50px', height: '75px', marginRight: '16px' }} />
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
            </Box>
        </Box>
    );
}

export default MoviesList;
