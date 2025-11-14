const jwt = require("jsonwebtoken");

module.exports = (socket, next) => {
  let token = socket.handshake.auth.token;

  if (!token) {
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  } 
  if (!token) {
    console.log("Authentication failed: No token provided");
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    console.log("User authenticated:", user.username);
    next();
  } catch (err) {
    console.log("Authentication failed: Invalid token", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
};