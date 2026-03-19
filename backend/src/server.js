import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import cookieParser from "cookie-parser";

import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import { protectedRoute } from "./middlewares/authMiddlewares.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

//middleware
app.use(express.json());
app.use(cookieParser());

//public routers
app.use("/api/auth", authRoute);

//private routers
app.use(protectedRoute);
app.use("/api/users", userRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running ${PORT}`);
  });
});
