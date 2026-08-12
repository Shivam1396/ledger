let express= require('express');
let cookie_parser=require("cookie-Parser")

let authrouter=require("./routes/auth_route")
let app= express();
app.use(express.json())
app.use(cookie_parser())
app.use("/api/auth" , authrouter)
module.exports= app;