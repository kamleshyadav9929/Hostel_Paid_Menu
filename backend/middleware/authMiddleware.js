import jwt from "jsonwebtoken";

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token expired or invalid" });
  }
}

/**
 * Requires the authenticated user to have 'admin' role.
 * Must be used AFTER authenticate middleware.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
