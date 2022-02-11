import { execSync } from 'child_process';
import path = require("path")

// TODO: add logging here
export const executeAndLogCommand = (command: string, commandOptions: number[]) => {
  execSync(command, {
    stdio: commandOptions,
    cwd: path.resolve(__dirname, ""),
  });
  console.log(`done: ${command}`);
}