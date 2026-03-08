const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  // read token from cookie or Authorization header (Bearer)
  const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach only the userId to req.user
    req.user = { id: decoded.userId };

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};