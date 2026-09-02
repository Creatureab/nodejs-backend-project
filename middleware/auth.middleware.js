import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const publicRoutes = [
  { path: "/api/v1/auth/login", method: "POST" },
  { path: "/api/v1/auth/register", method: "POST" },
  { path: "/api/v1/categories", method: "GET" },
  { path: "/api/v1/products", method: "GET" },
];

export const authMiddleware = (req, res, next) => {
  try {
    if (req.method === "OPTIONS") {
      return next();
    }

    const path = req.originalUrl.split("?")[0];
    const method = req.method;

    const isPublic = publicRoutes.some(
      (route) => route.path === path && route.method === method,
    );

    if (isPublic) {
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

    req.auth = {
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
