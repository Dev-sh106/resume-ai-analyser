/**
 * JWT Authentication Middleware
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "resumetester_jwt_secret_dev_key_2026";

const protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // Optional auth: continue without user if no token
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

const requireAuth = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required for this action." });
  }
  next();
};

module.exports = { protect, requireAuth, JWT_SECRET };
