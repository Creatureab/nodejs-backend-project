export const handleRouterError = (error, res) => {
  console.error("error", error);

  return res.status(500).json({
    success: false,
    message: error.message,
  });
};
