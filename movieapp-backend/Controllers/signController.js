const bcrypt = require('bcryptjs');
const User = require('../models/User');


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

module.exports = signup;