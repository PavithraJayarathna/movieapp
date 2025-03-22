import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User is not registered" });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, process.env.KEY, { expiresIn: '1h' });

        // Set the cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 360000 });

        // Send response with username
        return res.status(200).json({
            status: true,
            message: "Login successful",
            user: {
                username: user.username
            }
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}

// Add the default export
export default login;
