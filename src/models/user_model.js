let mongoose=require('mongoose');
let bcrypt=require('bcryptjs');
let userSchema=new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:[true, "Email already exists"],lowercase:true ,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ , "Please enter a valid email address"] 
    },
    //above in email case we use match and inside the match we use the email regex which is used to validate the email address format. It checks if the email address follows the standard pattern of a valid email address.

    password:{type:String, required:true, minlength:[6, "Password must be at least 6 characters long"] , 
        select:false
        //the select false means that when we query the user model
        //  the password field will not be returned by default. This is a security measure to prevent the password from being exposed in API responses or logs.
    },
    phone_number:{type:Number,unique:true, required:true},
} , {timestamps:true}
//
)

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    let hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    //in above line 
    // we just make the password to the hash format and store that hashed password in hash . 

})
//This hook runs before saving a user document, and skips hashing if the password field wasn't changed (avoids re-hashing an already-hashed password on unrelated updates). 
// It hashes the password with bcrypt for security, then assigns the hash back to this.password so the hashed value (not the plain text) gets saved.
// NOTE: we removed the `next` callback param entirely and just use async/await.
// Mixing `async function` with a `next` callback confuses Mongoose's internal check
// of the function's arity (fn.length) to decide callback vs promise style — that
// mismatch is what was causing "next is not a function". Just returning a promise
// (i.e. using async/await with no next) is the safe, modern way to write this hook.

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password , this.password)
}


//This defines an instance method comparePassword on the user schema, used during login. It takes the plain-text password entered by the user and compares it 
// against this.password — the hashed password stored in the database for that user. bcrypt.compare re-hashes the input internally and checks if it matches the stored hash, returning true or false (without ever needing to decrypt the stored hash, since bcrypt hashing is one-way).

let model=mongoose.model('user',userSchema);
module.exports=model;