import { EOL } from "os";

/**
 * Logs a formatted message to the specified logger
 *
 * @param message the message to log
 * @param symbol any UTF-8 symbol to surround the message with
 * @param logger a Console logger instance to log to
 */
export const statusLog = (message: string, symbol: string, logger: Console) => {
  logger.log(`--- ${symbol} ${message} ${symbol} ---`);
};

/**
 * Logs a formatted message to the specified logger and
 * includes the time difference in seconds. Outputs a newline.
 *
 * @param message the message to log
 * @param symbol any UTF-8 symbol to surround the message with
 * @param startTimeMs milliseconds elapsed before calling this function
 * @param logger a Console logger instance to log to
 */
export const finishedStatusLog = (
  message: string,
  symbol: string,
  startTimeMs: number,
  logger: Console
) => {
  const s = (performance.now() - startTimeMs) / 1000;
  const m = `${message} in ${s} seconds`;
  statusLog(m, symbol, logger);
  logger.log(EOL);
};
