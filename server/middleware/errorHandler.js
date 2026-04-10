// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  
  console.error(`[${new Date().toISOString()}] ${err.message}`);

  res.status(statusCode).json({
    error: true,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
