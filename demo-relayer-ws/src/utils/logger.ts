import { Logger, ConsoleTransport, FileTransport } from "zario";
import { env } from "../config/env";

export const logger = new Logger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  colorize: true,
  transports: [
    new ConsoleTransport({ colorize: true }),
    ...(env.NODE_ENV === "production"
      ? [new FileTransport({
          path: './logs/app.log',
          maxSize: 10485760, // 10MB
          maxFiles: 5,
          compression: 'gzip'
        })]
      : []
    )
  ],
  prefix: "[RelayerWS]",
});