export const handleRouterError = (error, req, res, next) => {
  console.error("error", error);

  return res.status(500).json({
    success: false,
    message: error.message,
  });
};
