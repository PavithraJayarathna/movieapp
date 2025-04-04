import mongoose from 'mongoose';

const UserMovieSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  savedMovies: [{ type: String, required: true }],
});

const UserMoviesModel = mongoose.model("UserMovies", UserMovieSchema);

export default UserMoviesModel;
