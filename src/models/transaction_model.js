let mongoose=require("mongoose")

let transactionSchema=new mongoose.Schema({
    //generally have two account one where the money go and second where money is going from
    fromAcount:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"account" , 
        required:[true , "transactionn must be associated from the from account"]

    } ,
        toAcount:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"account" , 
        required:[true , "transactionn must be associated from the to account"]
        
    } , 

    status:{
        type:String , 
        enum:{
            values:["PENDING" , "COMPLETED" , "FAILED" , "REVERSED"], 
            message:"status can be either PENDING , COMPLETED FAILED or REVERSED"
        
        } 
    } , 
        default:"PENDING" ,


amount:{
    type:Number , 
    required:[true , "amount is required for creating transaction"] , 
    min:[0 , "Transaction cannot be in negative number"]
} , 
idempotencyKey:{
    type:String , 
    required:[true , "Idempotency key is required for transaction"] , 
    index:true , 
    unique:true
}
},
{
    timestamps:true
}


)

let model=mongoose.model("transaction" , transactionSchema)
module.exports=mongoose.model