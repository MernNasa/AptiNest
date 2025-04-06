const jwt = require('jsonwebtoken');

const verifyToken=(req,res,next)=>{
    const token = req.cookies.token;
    if(!token) return res.status(401).json({ message: 'Access denied' })
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
          } catch (err) {
            res.status(400).json({ message: 'Invalid token' });
          }
}

const authorizeRoles = (requiredRole) => {
    return (req, res, next) => {
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: Access denied' });
      }
      next();
    };
  };
  module.exports = { verifyToken, authorizeRoles };