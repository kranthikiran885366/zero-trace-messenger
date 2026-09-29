const dotenv = require('dotenv');

// Load .env if present
dotenv.config({ path: process.env.DOTENV_PATH || undefined });

const parseBool = (v, d=false) => {
  if (v === undefined) return d;
  return ['1','true','yes','on'].includes(String(v).toLowerCase());
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/securechat',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  redisUrl: process.env.REDIS_URL || null,
  kafka: {
    brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : null,
    clientId: process.env.KAFKA_CLIENT_ID || 'securechat-backend',
    ssl: parseBool(process.env.KAFKA_SSL, false),
    sasl: process.env.KAFKA_SASL_MECHANISM ? {
      mechanism: process.env.KAFKA_SASL_MECHANISM,
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    } : null
  },
  uploads: {
    maxBytes: (parseInt(process.env.FILE_UPLOAD_MAX_MB || '100', 10)) * 1024 * 1024
  }
};
