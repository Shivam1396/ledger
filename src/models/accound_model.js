let mongoose = require("mongoose");

let accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, //this means that  the account of that specific userid is fetched of the given refrence as user
    ref: "user", //this is a pointer 
    required: [true, "Account must be associated with a user"] , 
    index:true
  },
  status: {
    type: String,
    enum: { //enum is a validator. It restricts the field so it can only ever hold one of a fixed set of values — nothing else is allowed.
      values: ["ACTIVE", "FROZEN", "CLOSED"],
      message: "{VALUE} is not a valid status"
    },
    default: "ACTIVE"
  },
  currency: {
    type: String,
    required: [true, "currency is required for creating an account"],
    default: "INR"
  }
}, { timestamps: true });

accountSchema.index({user:1 , status:1})
//MongoDB will build an internal, sorted lookup structure based on user first, then status. 
// The 1 just means "ascending order" (you'd use -1 for descending — for indexes it barely matters which direction since MongoDB can scan either way).

let accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;