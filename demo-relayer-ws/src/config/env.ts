import "dotenv/config";

const getEnvVar = (name: string, fallback: string): string => {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value;
};

const getEnvNumber = (name: string, fallback: number): number => {
  const value = parseInt(getEnvVar(name, fallback.toString()));
  if (isNaN(value)) throw new Error(`Invalid number for ${name}`);
  return value;
};

export const env = {
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  PORT: getEnvNumber("PORT", 8081),
  CORS_ORIGIN: getEnvVar("CORS_ORIGIN", "http://localhost:5173"),
  WS_HEARTBEAT_INTERVAL: getEnvNumber("WS_HEARTBEAT_INTERVAL", 30000),
} as const;
