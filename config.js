// MongoDB configuration
// For local MongoDB, keep these values as they are.
// If you use MongoDB Atlas, replace MONGODB_URI with your Atlas connection string.

const config = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  DB_NAME: process.env.DB_NAME || 'movieapp',
  PORT: Number(process.env.PORT) || 5050
};

module.exports = config;
