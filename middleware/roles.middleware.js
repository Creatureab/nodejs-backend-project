import { authMiddleware } from "./auth.middleware.js";

const roleAuth = (allowedRoles) => {
  return [authMiddleware, (req, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(req.auth.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permission",
        });
      }
      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }];
};

export const adminOnly = roleAuth(["admin"]);

export const userOnly = roleAuth("user");

export const userAndAdmin = roleAuth(["admin", "user"]);
