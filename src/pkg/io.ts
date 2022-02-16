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
  logger: Console | null = null,
  options: ExecSyncOptionsWithStringEncoding = { encoding: "utf-8" }
) => {
  const child = await exec(cmd, options, (err, stdout, stderr) => {
    const commandLog = `> ${cmd}`;
    console.log(commandLog);
    if (err) {
      if (logger) {
        logger.log(commandLog);
        logger.error(`error: ${err.message}`);
      }
      console.error(`error: ${err.message}`);
      return;
    } else {
      if (logger) {
        logger.log(commandLog);
        if (stdout) logger.log(`stdout: ${stdout}`);
        if (stderr) logger.log(`stderr: ${stderr}`);
      }
      if (stdout) console.log(`stdout: ${stdout}`);
      if (stderr) console.log(`stderr: ${stderr}`);
    }
  });

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(`Command (${cmd}) failed with status code ${code}`);
      }
    });
  });
};
