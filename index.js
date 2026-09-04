import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import i18next from "i18next";
import backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import categoryRouter from "./routes/category.route.js";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import productsRouter from "./routes/product.route.js";
import orderRouter from "./routes/order.route.js";
import adminUserRouter from "./routes/admin.user.route.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

i18next
  .use(backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "locales/{{lng}}.json",
    },
  });

const app = express();
const port = process.env.PORT || 5000;
const api = process.env.API || "/api/v1";
const mongoUri =
  process.env.CONNECT_STRING || "mongodb://127.0.0.1:27017/BackendDatabase";

app.use(morgan("tiny"));
app.use(express.json());

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// Only check Cloudinary credentials in development
if (process.env.NODE_ENV !== 'production') {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("Warning: Cloudinary credentials are not set.");
    console.error("Image uploads will fail without proper credentials.");
  }
}

app.use(middleware.handle(i18next));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://mydomain.com", process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  }),
);
app.use("/public/uploads", express.static("public/uploads"));

// Public routes (no authentication required)
app.get(`${api}/health`, (req, res) => {
  res.send("Hello, Node.js project");
});

app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce API is running",
    status: "healthy",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      products: "/api/v1/products",
      categories: "/api/v1/categories",
      orders: "/api/v1/orders",
      admin: "/api/v1/admin/users"
    }
  });
});

// Apply auth middleware to protected routes
app.use(authMiddleware);

app.use(`${api}/categories`, categoryRouter);

app.use(`${api}/auth`, authRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/admin/users`, adminUserRouter);

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(port, () => {
      console.log(`App Listening on Port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
