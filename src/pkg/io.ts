import { execSync, SpawnSyncReturns } from 'child_process';
import path = require("path")

// TODO: add logging to stdout as well as 
export const executeAndLogCommand = (command: string, commandOptions: number[], cwd = "") => {
  let succeeded = true;
  try {
    execSync(command, {
      stdio: commandOptions,
      cwd: path.resolve(__dirname, cwd),
    });
    console.log(`done: ${command}`);
  } catch (err) {
    const error = err as SpawnSyncReturns<string | Buffer>
    succeeded = false;
    console.log(`error: ${error.stdout}`);
  }
  return succeeded;
}