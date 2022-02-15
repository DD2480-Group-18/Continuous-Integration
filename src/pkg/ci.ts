import { CIConfig } from "../types/types";
import { readFile } from "fs/promises";
import path from "path";
import { CMD_EXEC_OPTIONS, CI_FILE_NAME } from "../constants/constants";
import { executeAndLogCommand } from "./io";

/**
 * Creates a parent- (if not existing) and job-directory
 *
 * @param jobDirectory the relative path of the directory to create
 */
export const createJobDirectory = (jobDirectory: string) => {
  const createDirsCommand = `mkdir -p "${jobDirectory}"`;
  executeAndLogCommand(createDirsCommand, CMD_EXEC_OPTIONS);
};

/**
 * Clones repository into the specified directory
 *
 * @param sshURL the SSH URL of the git repository to clone
 * @param branchRef the reference name of the branch to clone
 * @param intoDirectory the directory to clone the repository into
 */
export const cloneRepository = (
  sshURL: string,
  branchRef: string,
  intoDirectory: string
) => {
  const branch = branchRef.substring("refs/heads/".length);
  const cloneCommand = `git clone ${sshURL} . --branch ${branch}`;
  executeAndLogCommand(cloneCommand, CMD_EXEC_OPTIONS, intoDirectory);
};

/**
 * Reads the CI config file and returns its contents
 *
 * @param jobDirectory the path to the directory of the CI job
 * @returns the CI config file, or null if it did not exist
 */
export const getRepositoryConfig = async (jobDirectory: string) => {
  const configFilePath = path.join(jobDirectory, CI_FILE_NAME);
  const ciConfigFileBuffer = await readFile(configFilePath);
  if (!ciConfigFileBuffer) return null;

  const config: CIConfig = JSON.parse(ciConfigFileBuffer.toString());
  return config;
};

/**
 *
 */
export const runCISteps = (steps: string[], workingDirectory: string) => {
  let succeeded = true;
  for (let step in steps) {
    executeAndLogCommand(step, CMD_EXEC_OPTIONS, workingDirectory);
  }
  return succeeded;
};
