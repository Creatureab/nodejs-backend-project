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
    console.log("\n========== AUTH MIDDLEWARE ==========");

    console.log("➡️ Method:", req.method);
    console.log("➡️ Original URL:", req.originalUrl);

    // Allow CORS preflight requests
    if (req.method === "OPTIONS") {
      console.log("✅ OPTIONS request - skipping authentication");
      console.log("====================================\n");
      return next();
    }

    const path = req.originalUrl.split("?")[0];
    const method = req.method;

    console.log("➡️ Request path:", path);
    console.log("➡️ Request method:", method);

    // Check public routes
    const isPublic = publicRoutes.some(
      (route) => route.path === path && route.method === method,
    );

    console.log("➡️ Is public route:", isPublic);

    if (isPublic) {
      console.log("✅ Public route - authentication not required");
      console.log("====================================\n");
      return next();
    }

    // Authorization header
    const authorization = req.headers.authorization;

    console.log(
      "➡️ Authorization header:",
      authorization ? "Present" : "Missing",
    );

    const [scheme, token] = authorization?.split(" ") ?? [];

    console.log("➡️ Auth scheme:", scheme || "None");
    console.log("➡️ Token:", token ? "Present" : "Missing");

    if (scheme !== "Bearer" || !token) {
      console.log("❌ Invalid/missing Bearer token");

      console.log("====================================\n");

      return res.status(401).json({
        success: false,
        message: "Access Token Is required",
      });
    }

    // Check SECRET
    console.log(
      "➡️ JWT SECRET:",
      process.env.SECRET ? "Loaded ✅" : "Missing ❌",
    );

    if (!process.env.SECRET) {
      console.error("❌ SECRET environment variable is missing");

      console.log("====================================\n");

      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Verify token
    console.log("🔐 Verifying JWT token...");

    const decoded = jwt.verify(token, process.env.SECRET);

    console.log("✅ JWT verified successfully");
    console.log("➡️ Decoded user:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      userName: decoded.userName,
      phoneNumber: decoded.phoneNumber,
    });

    // Attach authenticated user
    req.auth = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      userName: decoded.userName,
      phoneNumber: decoded.phoneNumber,
    };

    console.log("✅ req.auth created successfully");
    console.log("➡️ Auth user ID:", req.auth.id);
    console.log("➡️ Auth role:", req.auth.role);

    console.log("✅ Authentication successful");
    console.log("====================================\n");

    next();
  } catch (error) {
    console.error("\n❌ AUTH MIDDLEWARE ERROR");
    console.error("➡️ Error name:", error.name);
    console.error("➡️ Error message:", error.message);

    console.error("➡️ Request:", {
      method: req.method,
      path: req.originalUrl,
    });

    console.log("====================================\n");

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
