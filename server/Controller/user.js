const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RegisterModel = require("../Model/RegisterModel")
const auth = require("../Middleware/auth")
const signIn = async (req,res)=>{
    try {
       const data = await RegisterModel.findOne({Email:req.body.email})
       const passwordMatch = await bcrypt.compare(req.body.password,data.Password)
       const token = await jwt.sign({Email : data.Email}, process.env.SECRET)
       
       if(!data) return res.status(404).json({islogin:false, message: "User doesn't exist" })
       if(!passwordMatch) return res.status(400).json({islogin:false,message: "Incorrect Password"})
       
       if(passwordMatch){
        res.cookie('newToken',token, { maxAge: 900000, httpOnly: true});
        res.status(200).send({id:data._id,email:data.Email,name:data.Name,islogin:true,token:token,admin:data.Admin})
        
         }
    } catch (error) {
        res.status(404).json({islogin:false,message:"User doesn't exist"})
        console.log(error)
    }
}

const signUp = async (req,res)=>{
    try {
          const cryptedPass = await bcrypt.hash(req.body.password,12)
          const insertData = new RegisterModel({
            Name:req.body.name,
            Email:req.body.email,
            Password:cryptedPass
          })
          const data = await insertData.save()
          const token = await jwt.sign({Email : data.Email}, process.env.SECRET)
          res.cookie('newToken',token, { maxAge: 900000, httpOnly: true });
          res.status(201).send({isRegister:true,errorMsg:"Register Successfully"})
         

    } catch (error) {
        if(error.code === 11000){
            res.status(409).send({isRegister:false,errorMsg:"This is Email id is already register"})
        }
        else{
            // res.send({isRegister:false,errorMsg:error})
            console.log(error);
        }
    }
   
}

const requestForAdmin = async(req,res)=>{
    try {
        const data = await RegisterModel.find({Admin:false})
        res.send(data)
        res.end()
    } catch (error) {
        res.send(error)
        res.end()
    }
}

const acceptAdmin = async(req, res)=>{
    try {
     
      const data = await RegisterModel.updateOne({_id:req.body.id},{Admin:true,AdminType:"Admin"})
      res.end()
    } catch (error) {
        res.send(error)
    }
}
const rejectAdmin = async(req,res)=>{
    try {
        await RegisterModel.deleteOne({_id:req.body.id})
        res.end()
    } catch (error) {
        res.end()
    }
}
module.exports = {signIn,signUp,requestForAdmin,acceptAdmin,rejectAdmin};