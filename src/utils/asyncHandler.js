const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (error) {
    console.error('ERROR in handler:', error);
    // Prefer your custom statusCode, fallback to 500
    let status = error.statusCode || error.code || 500;
    // If status is not a valid HTTP code, hard-set to 500
    if (typeof status !== 'number' || status < 100 || status > 599) {
      status = 500;
    }
    res.status(status).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export { asyncHandler };
