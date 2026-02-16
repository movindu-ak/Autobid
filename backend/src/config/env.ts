import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  CORS_ORIGIN: string[];
}

const getEnv = (): EnvConfig => {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  // return {
  //   NODE_ENV: process.env.NODE_ENV || 'development',
  //   PORT: parseInt(process.env.PORT || '5000', 10),
  //   MONGO_URI: process.env.MONGO_URI!,
  //   JWT_SECRET: process.env.JWT_SECRET!,
  //   JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  //   CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // };

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    MONGO_URI: process.env.MONGO_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map(s => s.trim()),
  };
};

export const env = getEnv();
