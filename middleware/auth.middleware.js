import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const publicRoutes = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/categories",
  "/api/v1/products",
  "GET:/public/uploads",
];

export const authMiddleware = (req, res, next) => {
  try {
    const path = req.originalUrl.split("?")[0];

    if (publicRoutes.includes(path)) {
      return next();
    }

    const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Access Token Is required",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      userName: decoded.userName,
      phoneNumber: decoded.phoneNumber,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
