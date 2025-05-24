const User = require('../models/User')
const jwt=require('jsonwebtoken')

const createToken=(_id,email)=>{
    return jwt.sign({_id,email},process.env.JWT_SECRET, {expiresIn: '3d'})

}
//login user
const loginUser=async(req,res)=>{
const{email,password}=req.body

try{
    const user=await User.login(email, password)

    //create a token
    const token = createToken(user._id,user.email)

    return res.status(200).json({token})
}catch(error){
  res.status(400).json({error: error.message})
}
   
}



//signup user
const signupUser=async(req,res)=>{
    const {email,password} =req.body
    try{
        const user=await User.signup(email, password)

        //create a token
        const token = createToken(user._id,user.email)

        res.status(200).json({token})
    }catch(error){
      res.status(400).json({error: error.message})
    }
    
}

module.exports={
    loginUser,
    signupUser
}