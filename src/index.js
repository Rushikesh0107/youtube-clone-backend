import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((error => {
    console.log("MONGODB CONNECTION FAILED", error)
}))

/*
import express from "express"
const app = express()

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        
        app.on("error", (error) => console.error(error))

        app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`)
    } catch (error) {
        console.error(error)
        throw error
    }
})()

*/