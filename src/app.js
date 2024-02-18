import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import userRouter from './routes/user.routes.js'
import subscriptionRouter from "./routes/subscription.route.js"
import videoRouter from "./routes/video.route.js"
import playlistRouter from "./routes/playlist.route.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Routes import



// Routes declaration

app.use("/api/v1/users", userRouter)

app.use("/api/v1/subscription",subscriptionRouter )

app.use("/api/v1/videos", videoRouter)

app.use("/api/v1/playlist", playlistRouter)

export {app}