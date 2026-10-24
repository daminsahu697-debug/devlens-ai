/**
 * Centralized Error Handling Middleware
 * Ensures safe, structured JSON errors without leaking stack traces or internal secrets.
 */
export function errorHandler(err, req, res, next) {
  // Log server-side for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.clientMessage || err.message || 'An unexpected error occurred while processing your request.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code
    }
  });
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
      code: 'NOT_FOUND'
    }
  });
}
