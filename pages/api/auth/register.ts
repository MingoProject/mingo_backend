import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import User from "@/database/user.model";
import { connectToDatabase } from "@/lib/mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      gender,
      birthDay,
    } = req.body;

    // Kiểm tra xem tất cả các thông tin cần thiết đã được cung cấp chưa
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !email ||
      !password ||
      gender === undefined ||
      !birthDay
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    try {
      await connectToDatabase();
      // Kiểm tra xem người dùng đã tồn tại chưa
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this phone number." });
      }

      // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Tạo đối tượng người dùng mới
      const newUser = new User({
        firstName,
        lastName,
        phoneNumber,
        email,
        password: hashedPassword,
        gender,
        birthDay,
        attendDate: new Date(),
        roles: ["user"],
        flag: true,
        createBy: null,
      });

      // Lưu người dùng vào cơ sở dữ liệu
      await newUser.save();

      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  } else {
    // Phương thức không hỗ trợ
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
