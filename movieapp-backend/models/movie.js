const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    tmdbId: { type: Number, required: true, unique: true },
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre: {type: [String], required: true},
    director: {type: String, required:true},
    cast:{type: [String], required: true},
    releasedate: {type: Date, required: true},
    language: {type: String, required: true},
    duration: {type: String, required: true},
    rating: {type: Number, required: true},
    poster_urls: [String], 
    backdrop_urls: [String] 

})
const MovieModel = mongoose.model("movie", MovieSchema);
module.exports = MovieModel;