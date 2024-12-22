import  express from 'express';
import cors from 'cors';
import connectToMongoDB from './database/connectToMongoDB.js';
import Userclass from './models/userModel.js';

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
const port =4010;

dotenv.config()

const app =express()

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}))

app.get('/',(req,res)=>{
    res.send("Hi from backend")
})

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Update the path as needed
});


app.get('/verificationcheck', (req, res) => {
    res.sendFile(path.join(__dirname, 'verification.html')); // Update the path as needed
});


const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"jashwanthbandi7577@gmail.com",
        pass:process.env.PASS,
    }
})
transporter.verify((err,success)=>{
    if(err){ 
        console.log(err)
    }
    else{ 
        console.log("Nodemailer connection successful")
    }
})

app.post('/registrationcheck',async (req,res)=>{
    const {username,email,password}=req.body;
    console.log('Received Body:', req.body);
    try{
        const checkEmail =await Userclass.findOne({email});
        if(checkEmail){
            return res.status(400).json({message:"Email already exists"})
        }
        const otp=Math.floor(1000+ Math.random()*9000)
        const newUser = new Userclass({
            username:username,
            email:email,
            password:password,
            otp:otp
        })
        const mailOptions={
            from:"jashwanthbandi7577@gmail.com",
            to:email,
            subject:"OTP for registration",
            html:`
            <div style="background-color:#242424;color:white;padding:20px;border-radius:10px;text-align:center;">
                <p>Hi ${username}</p>
                <p>Your OTP for creating an acount is ${otp}</p>
            </div>
            `

        }
        transporter.sendMail(mailOptions,(err,success)=>{
            if(err){
                console.log(err);
                return res.status(500).json({ error: "Failed to send OTP" });
            }
            else{
                return res.status(200).json({message:"OTP Sent"})
            }
        });
        await newUser.save();

    }
    catch(error){
        console.log(error)
        return res.status(500).json({error:"Internal server error"});
    }
});
app.post('/verificationcheck',async (req,res)=>{
    const userOtp=parseInt(req.body.otp);
    try{
        
        const checkOtp=await Userclass.findOne({otp:userOtp})
        if(checkOtp && checkOtp.otp!==undefined && checkOtp.otp===userOtp){
            return res.status(200).json({message:"OTP Verified"})
        }
        return res.status(400).json({error:"Incorrect OTP"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({error:"Internal server error"})
    }
})

app.listen(port,()=>{
    console.log("server started")
    connectToMongoDB()
})