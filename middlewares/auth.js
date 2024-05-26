const jwt = require('jsonwebtoken');
const { rolePermissions, jwtSecret } = require('../roleConfig');

const signAccessToken = (userId, role) => {
  return new Promise((resolve, reject) => {
    const payload = { role };

    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "1y", // Set expiration time to one hour
      issuer: "pickurpackage.com",
      audience: userId,
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error("Error signing access token:", err.message);
        reject(
          createError.InternalServerError("Failed to sign access token")
        );
      } else {
        resolve(token);
      }
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());

  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(createError.Unauthorized(message));
    }

    req.payload = payload;
    next();
  });
};


const authorizeRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (roles.includes('*') || roles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
    }
  };
};

const authorizeRoute = (req, res, next) => {
  const userRole = req.user.role;
  const requestedRoute = req.baseUrl + req.route.path;

  if (rolePermissions[userRole].includes('*') || rolePermissions[userRole].includes(requestedRoute)) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
  }
};

module.exports = { signAccessToken, verifyAccessToken, authorizeRole, authorizeRoute };
