
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use("/api", chatRoutes);

app.get("/", (req, res) => {
    res.send("VChat-AI Backend is Running!");
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");

        app.listen(PORT, () => {
            console.log(`VChat-AI server running on ${PORT}`);
        });
    } catch (err) {
        console.log("Database Connection Failed:", err.message);
        process.exit(1);
    }
};

connectDB();
