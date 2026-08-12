let mongoose=require('mongoose');

function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("database is connected to server")
    })
.catch(err=>{
    console.log(err); 
    process.exit(1); 
    // exit the process with failure it basically indicates the application has failed to start due to some error     
})
}

module.exports=connectDB;