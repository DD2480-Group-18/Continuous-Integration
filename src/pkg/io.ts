import { exec, ExecSyncOptionsWithStringEncoding } from "child_process";

/**
 * Executes a given console command and logs the results
 *
 * @param cmd the command to execute
 * @param options set options like encoding, working dir, timeout, etc.
 * @param logger a logger for logging the results, defaults to console
 * @returns true if the request successfully created a commit status
 */
export const execute = async (
  cmd: string,
  options: ExecSyncOptionsWithStringEncoding,
  logger: Console | null = null
) => {
  const child = exec(cmd, options, (err, stdout, stderr) => {
    if (err) {
      if (logger) {
        logger.error(`error: ${err.message}`);
      }
      console.error(`error: ${err.message}`);
      throw err;
    }
    if (logger) {
      if (stdout) logger.log(`stdout: ${stdout}`);
      if (stderr) logger.log(`stderr: ${stderr}`);
    }
    if (stdout) console.log(`stdout: ${stdout}`);
    if (stderr) console.log(`stderr: ${stderr}`);
  });

  await new Promise((resolve) => {
    child.on("close", resolve);
  });
};
