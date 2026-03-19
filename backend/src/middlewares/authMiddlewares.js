import jwt from "jsonwebtoken";
import User from "../models/User.js";

//
export const protectedRoute = (req, res, next) => {
  try {
    //lấy token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "không tìm thấy token" });
    }

    // xác nhận token hợp lệ
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "token hết hạn hoặc không đúng" });
        }
        // tìm user
        const user = await User.findById(decodedUser.userId).select(
          "-hashedPassword",
        );

        // trả user về trong req
        if (!user) {
          return res.status(404).json({ message: "không tìm thấy user" });
        }

        req.user = user;
        next();
      },
    );
  } catch (error) {
    console.error("lỗi khi xác minh jwt trong authMiddleware");
    return res.status(500).json({ message: "lỗi hệ thống" });
  }
};
