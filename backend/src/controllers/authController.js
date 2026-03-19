import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "30m"; // thường chỉ 15p or 5p
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày theo mili giây

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.this.status(400).json({
        message:
          "không thể thiếu username, password, email, firstName và lastName",
      });
    }

    //kiểm tra username có tồn tại chưa
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: "username đã tồn tại" });
    }

    //mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    // tạo user mới
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    // return
    return res.sendStatus(204);
  } catch (error) {
    console.log("lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    // lấy input
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password" });
    }

    // lấy hashedPassword so sánh với password người dùng vừa nhập

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    // nếu khớp, tạo access Token với JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // lưu refresh token vào session
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, //cookie này không truy cập bằng js
      secure: true, // đảm bảo gửi qua https
      sameSite: "none", // backend, frontend deploy riêng
      maxAge: REFRESH_TOKEN_TTL,
    });

    // trả access token về trong res
    return res
      .status(200)
      .json({ message: `User ${user.displayName} đã login `, accessToken });
  } catch (error) {
    console.log("lỗi khi gọi SignIn", error);
    return res.status(500).json({ message: "lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    // lấy refresh token tù cookie
    const token = req.cookie?.refreshToken;

    if (token) {
      // xóa refresh token trong Session
      await Session.deleteOne({ refreshToken: token });
      // xóa refresh token trong cookie
      res.clearCookie("refreshToken");
    }
  } catch (error) {
    console.log("lỗi khi gọi SignOut", error);
    return res.status(500).json({ message: "lỗi hệ thống" });
  }
};
