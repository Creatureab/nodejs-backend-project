import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export const genenrateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      userName: user.userName,
      phoneNumber: user.phoneNumber,
    },
    process.env.SECRET,
    {
      expiresIn: "7d",
    },
  );
};
