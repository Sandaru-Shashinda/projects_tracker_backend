import express, { Application, Request, Response, NextFunction } from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import connectDB from "./config/db"
import authRoutes from "./modules/auth/auth.routes"
import feedbackRoutes from "./modules/feedback/feedback.routes"
import auditRoutes from "./modules/audit/audit.routes"
import ministryRoutes from "./modules/ministry/ministry.routes"
import projectRoutes from "./modules/project/project.routes"
import mediaRoutes from "./modules/media/media.routes"

// Load env vars
dotenv.config()

// Connect to Database
connectDB()

const app: Application = express()
// Middleware
app.use(express.json()) // Body parser
app.use(cors()) // Enable CORS for frontend access
app.use(helmet()) // Security headers
app.use(morgan("dev")) // Logger

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/audit", auditRoutes)
app.use("/api/ministries", ministryRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/media", mediaRoutes)

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.send("Government Progress Tracker API is running...")
})

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
