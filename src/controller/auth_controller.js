let model = require("../models/user_model")
let jwt=require("jsonwebtoken")
let { sendRegisterationEmail } = require("../services/email_servicees");
 // adjust path to wherever your email file actually lives

console.log("DEBUG typeof:", typeof sendRegisterationEmail);

async function userregister(req, res) {
  try {
    let { name, email, password, phone_number } = req.body

    let isExist = await model.findOne({
      $or: [{ email: email }, { phone_number: phone_number }]
    })

    if (isExist) {
      let conflictField = isExist.email === email ? "email" : "phone number";
      return res.status(409).json({
        message: `User already exists with this ${conflictField}`
      })
    }

    let newuser = await model.create({
      name,
      email,
      password,
      phone_number
    })
    console.log(newuser)
    try{
await sendRegisterationEmail(newuser.email, newuser.name);
    }
    catch(emailErr){
      console.log("registeration email failed to send:" , emailErr);
    }
    //now we createe token for our system 
    //The short version: tokens let you prove
    //  who you are without repeatedly sending your password, and they let systems control access more precisely and safely.

    let token = jwt.sign({ id: newuser._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    //now we use cookie , the basic concept for the cookie is that the http is stateless everytime browsernsend a request 
    //toa server the server has no memory of your previous requests and everytime pageloads looklike stranger who never see 
    // u before and even if you loggin two seconds before
    //the cookie solve the problem and by letting the server "tag" your browserso it can recognize your cross requests
    //After you log in, the server gives your browser a cookie containing a session ID. Every subsequent request includes
    //  that cookie, so the server knows "oh, this is user #4521" without you re-entering your password on every page.

    res.cookie("token", token)

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newuser._id,
        name: newuser.name,
        email: newuser.email,
        phone_number: newuser.phone_number
      },
      token: token
    })

  } catch (err) {
    return res.status(500).json({
      message: "Registeration failed",
      err: err.message
    })
  }
}

async function userlogin(req , res){
    let {email , password }=req.body
    //here we use only two parameters one is email and second is password for log-in purpose

    let user=await model.findOne({
        email:email,
    }).select("+password")
    //at previous we sign password as false but in this log in we don't need to do that instead we can use password here to be compared
if(!user){
    return res.status(401).json({
        message:"user is not defined"
    })
}


let isValidpassword=await user.comparePassword(password)
if(!isValidpassword){
    return res.status(401).json({
        message:"password is not valid"
    })
}

    let token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })


    res.cookie("token", token)

    return res.status(200).json({
      message: "user login successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number
      },
      token: token
    })

}
module.exports = { userregister, userlogin };