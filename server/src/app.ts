import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes";

// Load environment variables
dotenv.config();

// Create the Express app instance
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());

// Define API routes
app.use("/api", apiRoutes);

// Health Check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is healthy" });
});

// Export the configured app
export default app;