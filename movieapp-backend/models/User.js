import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Define the UserModel after the schema definition
const UserModel = mongoose.model('User', UserSchema);

// Export it as default at the end of the file
export default UserModel;
