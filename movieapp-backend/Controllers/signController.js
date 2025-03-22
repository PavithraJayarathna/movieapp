import bcrypt from 'bcryptjs';      // Instead of 'const bcrypt = require('bcryptjs')'
import User from '../models/User.js';




const signup = async (req,res) => {
    try{
    const {username,password,email} = req.body;
    
    const user = await User.findOne({email});
    if(user)
        return res.json({message: "User is already Exist"});

    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        email, 
        password: hashpassword,    
    });

    await newUser.save()
    return res.json({message: "succesfully signup"});
}
catch(err){
    return res.status(500).json({messge: "server error", error: err.message});

}
}

export default signup;