module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  jwtExpire: process.env.JWT_EXPIRE || '7d'
};