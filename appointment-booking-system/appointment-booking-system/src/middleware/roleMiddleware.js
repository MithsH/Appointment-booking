// Restrict access based on user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set by protect middleware
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

// Check if user is provider (for provider-specific routes)
exports.isProvider = (req, res, next) => {
  if (req.user.role !== 'provider' && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Only providers can access this resource'
    });
  }
  next();
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
  next();
};
