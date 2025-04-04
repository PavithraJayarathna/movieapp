import axios from 'axios';
import UserMovies from '../models/MyMovies.js';

export const searchMovieByName = async (req, res) => {
    try {
        const movieName = req.params.movieName;

        // Fetch movies from TMDB by name
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieName)}&api_key=${process.env.TMDB_API_KEY}&language=en-US`;
        const searchResponse = await axios.get(searchUrl);

        if (searchResponse.data.results.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Get first search result
        const movieData = searchResponse.data.results[0];
        const movieId = movieData.id;

        // Fetch detailed movie data
        const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}&language=en-US`;
        const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}`;
        const imagesUrl = `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${process.env.TMDB_API_KEY}`;

        // Fetch all data in parallel
        const [movieResponse, creditsResponse, imagesResponse] = await Promise.all([
            axios.get(movieUrl),
            axios.get(creditsUrl),
            axios.get(imagesUrl),
        ]);

        const movieDetails = movieResponse.data;
        const creditsData = creditsResponse.data;
        const imagesData = imagesResponse.data;

        const director = creditsData.crew.find(crewMember => crewMember.job === 'Director');
        const directorName = director ? director.name : 'Unknown';

        // Create a response object without saving to the database
        const movieResult = {
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            description: movieDetails.overview,
            genre: movieDetails.genres.map(g => g.name),
            director: directorName,
            cast: creditsData.cast.map(actor => actor.name),
            releasedate: movieDetails.release_date,
            language: movieDetails.original_language,
            duration: `${Math.floor(movieDetails.runtime / 60)}h ${movieDetails.runtime % 60}m`,
            rating: movieDetails.vote_average,
            poster_urls: imagesData.posters.slice(0, 4).map(p => `https://image.tmdb.org/t/p/w500${p.file_path}`),
            backdrop_urls: imagesData.backdrops.slice(0, 3).map(b => `https://image.tmdb.org/t/p/w500${b.file_path}`),
        };

        return res.status(200).json(movieResult); // Send to frontend
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Fetch user's saved movies
export const getUserMovies = async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await UserMovies.findOne({ userID });

    if (!user) return res.json({ savedMovies: [] });

    res.json(user.savedMovies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Save a movie for a user
export const saveUserMovie = async (req, res) => {
  const { userID } = req.params;
  const { movieID } = req.body;

  try {
    let user = await UserMovies.findOne({ userID });

    if (!user) {
      user = new UserMovies({ userID, savedMovies: [movieID] });
    } else if (!user.savedMovies.includes(movieID)) {
      user.savedMovies.push(movieID);
    } else {
      return res.status(400).json({ message: "Movie already saved" });
    }

    await user.save();
    res.json({ message: "Movie saved!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Remove a movie from the user's bucket
export const removeUserMovie = async (req, res) => {
  const { userID, movieID } = req.params;

  try {
    const user = await UserMovies.findOne({ userID });

    if (user) {
      user.savedMovies = user.savedMovies.filter((id) => id !== movieID);
      await user.save();
    }

    res.json({ message: "Movie removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


/*const fetchAndSaveMovie = async (req, res) => {
    try {
        const movieId = req.params.movieId; 
        const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}&language=en-US`;

        const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}&language=en-US`;
        const movieImagesUrl = `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${process.env.TMDB_API_KEY}`;

       
        const movieResponse = await axios.get(movieUrl);
        const creditsResponse = await axios.get(creditsUrl);
        const movieimageRespose = await axios.get(movieImagesUrl);
        
        const movieData = movieResponse.data;
        const creditsData = creditsResponse.data;
        const movieimageData = movieimageRespose.data;

        
        const director = creditsData.crew.find(crewMember => crewMember.job === 'Director');
        
        
        const directorName = director ? director.name : 'Unknown';
        
        const tmdbId = Number(movieData.id);

        
        if (isNaN(tmdbId)) {
            return res.status(400).json({ message: 'Invalid TMDB movie ID format' });
        }

        const movie = new MovieModel({
            tmdbId: tmdbId, 
            title: movieData.title,
            description: movieData.overview,
            genre: movieData.genres.map(genre => genre.name),
            director: directorName,  
            cast: creditsData.cast.map(actor => actor.name),
            releasedate: movieData.release_date,
            language: movieData.original_language,
            duration: `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}m`,  
            rating: movieData.vote_average,
            poster_urls: movieimageData.posters.slice(0,4).map(poster => `https://image.tmdb.org/t/p/w500${poster.file_path}`),
            backdrop_urls: movieimageData.backdrops.slice(0,3).map(backdrop => `https://image.tmdb.org/t/p/w500${backdrop.file_path}`)
        });

        // Save movie 
        await movie.save();

        return res.status(201).json({ message: 'Movie added successfully', movie });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all movies from the database
const getMovies = async (req, res) => {
    try {
        const movies = await MovieModel.find();
        if (!movies || movies.length === 0) {
            return res.status(404).json({ message: 'No movies found.' });
        }
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get one movie by ID from the database
const getMovieById = async (req, res) => {
    try {
        const { id } = req.params; 
        
        
        const movieId = Number(id);

        if (isNaN(movieId)) {
            return res.status(400).json({ message: 'Invalid movie ID format' });
        }

      
        const movie = await MovieModel.findOne({ tmdbId: movieId });

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        return res.status(200).json(movie); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { fetchAndSaveMovie, getMovies,getMovieById };*/
