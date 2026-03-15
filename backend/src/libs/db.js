import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("liên kết csdl thành công");
  } catch (error) {
    console.log("lỗi khi kết nối csdl", error);
    process.exit(1);
  }
};
