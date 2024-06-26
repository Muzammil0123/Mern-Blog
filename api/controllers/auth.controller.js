import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs';
import errorHandler from '../util/error.js';
import jwt from 'jsonwebtoken';
const signup = async (req,res,next)=>{
      let {username,password,email}=req.body
      if(!username || !password||!email||username==""||password==""||email=="")
      {
          next(errorHandler(500,"All credentials are required"))
          return;
      }
      try{
          const hashpass=bcryptjs.hashSync(password,10);
      const user= await new User({
          username,
          password:hashpass,
          email
      }).save()
      res.send(user);
     }
     catch(err){
          next(err);
     }
}

const signin=async (req,res,next)=>{
     let {email,password}=req.body;
     if(!email||!password||email==""||password==""){
          return next(errorHandler(500,'Fill all the credentials'))
     }
     try{
          let user= await User.findOne({email})
          if(!user){
                return next(errorHandler(400,"Invalid User"));
          
          }
          const validpassword=bcryptjs.compareSync(password,user.password);
          if(!validpassword)
          return next(errorHandler(400,"Invalid Password"));
          const token=jwt.sign({id:user._id},process.env.JWT_SIGN);
          res.status(200).cookie('auth_token',token,{httpOnly:true}).json(user);
     }
     catch(err){
          next(errorHandler(500,err.message));
     }
}
const google =async (req,res,next)=>{
    let {email,username,photoURL}=req.body;
    console.log(req.body);
    try{
     const user=await User.findOne({email})
     if(user){
          const token=jwt.sign({id:user._id},process.env.JWT_SIGN);
          res.status(200).cookie('auth_token',token,{httpOnly:true}).json(user);
     }
     else{
          const password=Math.random().toString(36).slice(-8);
          const hashpass=bcryptjs.hashSync(password,10);
          username=username.split(' ').join('');
          const newUser =new User({
              email,
              username,
              password,
              profilePhoto:photoURL
              
          })
          let user=await    newUser.save();
          const token=jwt.sign({id:user._id},process.env.JWT_SIGN);
          res.status(200).cookie('auth_token',token,{httpOnly:true}).json(user);

     }
    
    }
    catch(error){
     next(error);
}
}
export default signup;
export {signin,google};