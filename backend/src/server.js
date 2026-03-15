import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";

import authRoute from "./routes/authRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

//middleware
app.use(express.json());

//public routers
app.use("/api/auth", authRoute);

//private routers

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running ${PORT}`);
  });
});
