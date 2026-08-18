let mongoose=require("mongoose");
let ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId , 
        ref:"account" , 
        required:[true , "ledger must be aassociated with account"] , 
        index:true , 
        immutable:true  //cannot be modified account detail


    }
    ,
    amount:{
        type:Number , 
        required:[true , "Amount is required to create a ledger entry"] , 
immutable:true
    } , 
    transaction:{
        type:mongoose.Schema.Types.ObjectId , 
        ref:"transaction" , 
        required:[true , ""] , 
        index:true , 
        immutable:true
    } , 
    type:{
        type:String , 
        enum:{
            values:["credit" , "debit"] , 
            message:"type can be either credit or debit"  
        } , 
        required:[true , "ledger type is required" ] , 
        immutable:true
    }
})

function preventLedgerModification(){
    throw new error("ledger entries are immutable and cannot be modified and deleted")
}
ledgerSchema.pre("findOneAndUpdate" , preventLedgerModification)
ledgerSchema.pre("updateOne" , preventLedgerModification)
ledgerSchema.pre("deleteOne" , preventLedgerModification)
ledgerSchema.pre("remove" , preventLedgerModification)
ledgerSchema.pre("deleteMany" , preventLedgerModification)
ledgerSchema.pre("updateMany" , preventLedgerModification)
ledgerSchema.pre("findOneAndDelete" , preventLedgerModification)
ledgerSchema.pre("findOneAndReplace" , preventLedgerModification)

let model=mongoose.model("ledger" , ledgerSchema)
module.exports=model