require('dotenv').config();
let app=require('./src/app');
let connectDB=require('./src/config/db');

connectDB();

console.log("Connecting with URI:", process.env.MONGO_URI);

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})