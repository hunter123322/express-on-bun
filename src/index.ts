import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import type { Request, Response, NextFunction } from "express"
import { setSecurityHeaders } from "./middlewares/security.headers"
import { MongoDBConnection } from "./utils/mongodb.connection"
import publicRouter from "./router/public"
import path from "path"
import adminRouter from "./router/admin"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const mongo = new MongoDBConnection(process.env.MONGO_URI || "mongodb://localhost:27017/Albay-tourist")

await mongo.connect().then(() => console.log("Mongodb connected")).catch(err => {
    console.error("Failed to connect to MongoDB:", err)
    process.exit(1)
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const allowedOrigin = process.env.ORIGIN || "http://localhost:3000"

// Middlewares
app.use(cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(setSecurityHeaders)

app.use("/v1/admin",  adminRouter)
app.use("/v1/public", publicRouter)

app.use(
    (err: unknown, req: Request, res: Response, next: NextFunction) => {
        console.error('Global error handler:', err);

        // Check if headers are already sent
        if (res.headersSent) {
            return next(err);
        }

        // Check if the request expects HTML
        const acceptsHtml = req.accepts('html');

        if (acceptsHtml) {
            // Render error page for HTML requests
            res.status(500).render('error', {
                message: "Internal Server Error",
                error: process.env.NODE_ENV === 'development' ? err : null
            });
        } else {
            // Send JSON for API requests
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})