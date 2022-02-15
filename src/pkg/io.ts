import {
  execSync,
  ExecSyncOptionsWithBufferEncoding,
  SpawnSyncReturns,
} from "child_process";
import path from "path";

// TODO: add logging to stdout as well as
export const executeAndLogCommand = (
  command: string,
  commandOptions: number[],
  cwd = ""
) => {
  let succeeded = true;
  try {
    let execOptions: ExecSyncOptionsWithBufferEncoding = {
      stdio: commandOptions,
    };
    if (cwd.length > 0) {
      execOptions = { ...execOptions, cwd };
    }
    execSync(command, execOptions);
    console.log(`done: ${command}`);
  } catch (err) {
    const error = err as SpawnSyncReturns<string | Buffer>;
    succeeded = false;
    console.log(`error: ${error.stdout}`);
    console.log(err);
  }
  return succeeded;
};
