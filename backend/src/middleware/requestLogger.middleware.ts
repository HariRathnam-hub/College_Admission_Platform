import morgan, { StreamOptions } from "morgan";
import { logger } from "../utils/logger";

const stream: StreamOptions = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream }
);
