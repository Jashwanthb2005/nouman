import mongoose from "mongoose";

async function connectToMongoDB(){
    await mongoose.connect('mongodb://127.0.0.1:27017/login1', { useNewUrlParser: true, useUnifiedTopology: true })

    .then(()=>{
        console.log("MongoDb Connection successful")
    })
    .catch((err)=>{
        console.log(err)
    })
}
export default connectToMongoDB