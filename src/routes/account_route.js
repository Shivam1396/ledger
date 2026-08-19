let express=require("express");
let auth_middleware=require("../middleware/auth_middleware")
let account_controller=require("../controller/account")
let router=express.Router();

router.post("/" , auth_middleware.authMiddleware , account_controller.creteaccount);
module.exports=router