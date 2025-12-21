import { Logger, ConsoleTransport, FileTransport } from "zario";
import { env } from "../config/env";
import { mkdirSync } from "fs";
import { resolve } from "path";

// Ensure logs directory exists
const logsDir = resolve("./logs");
mkdirSync(logsDir, { recursive: true });

export const logger = new Logger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  colorize: true,
  transports: [
    new ConsoleTransport({ colorize: true }),
    ...(env.NODE_ENV === "production"
      ? [
          new FileTransport({
            path: resolve("./logs/app.log"),
            maxSize: 10485760, // 10MB
            maxFiles: 5,
            compression: "gzip",
          }),
        ]
      : []),
  ],
  prefix: "[RelayerWS]",
});
