const User = require("../models/user");
const bcrypt= require("bcryptjs");
const jwt = require("jsonwebtoken");



exports.register = async(req,res)=>{
try{
    const {username, email, password} = req.body;
    
    const existingUser = await User.findOne({email});
    if(existingUser){
       return res.status(400).json({
            msg:"User already Exists!"
        });
    }

 
    const hashedPassword= await bcrypt.hash(password,10);

 
    const newUser = new User({username, email, password:hashedPassword});
    await newUser.save();

    return res.status(201).json({msg:"User created successfully"});

    
}catch(err){
   return res.status(500).json({msg: "An error occurred"});
}
};



exports.login = async (req,res)=>{
    try{
        const {email, password}= req.body;

        const user = await User.findOne({email});
        if(!user){
          return  res.status(401).json({
                msg:"User deos not exists"
            });
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
           return res.status(401).json({
                msg:"Invalid credentials"
            });
        }


        const token = jwt.sign({id:user._id, name:user.name}, process.env.JWT_SECRET,{
            expiresIn: "2h",
        });

       return res.status(200).json({
            token,
            user: {
                id: user._id,
                username:user.username,
                email:user.email
            }
        });


    }catch(err){
       return res.status(500).json({msg:err.msg});
    }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id username"); 
    res.status(200).json({ users });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ msg: "Failed to fetch users", error: err.message });
  }
};