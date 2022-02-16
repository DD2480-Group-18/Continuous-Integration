import { CIConfig } from "../types/types";
import { readFile } from "fs/promises";
import path from "path";
import { CI_FILE_NAME } from "../constants/constants";
import { execute } from "./io";

/**
 * Creates a parent- (if not existing) and directory
 *
 * @param dir the relative path of the directory to create
 */
export const createDirectory = async (dir: string) => {
  await execute(`mkdir -p "${dir}"`, {
    encoding: "utf8",
  });
};

/**
 * Clones repository into the specified directory
 *
 * @param sshURL the SSH URL of the git repository to clone
 * @param branchRef the reference name of the branch to clone
 * @param intoDirectory the directory to clone the repository into
 */
export const cloneRepository = async (
  sshURL: string,
  branchRef: string,
  intoDirectory: string
) => {
  const branch = branchRef.substring("refs/heads/".length);
  const cloneCommand = `git clone ${sshURL} . --branch ${branch}`;
  await execute(cloneCommand, {
    encoding: "utf8",
    cwd: intoDirectory,
  });
};

/**
 * Reads the CI config file and returns its contents
 *
 * @param jobDirectory the path to the directory of the CI job
 * @returns the CI config file, or null if it did not exist
 */
export const getRepositoryConfig = async (
  jobDirectory: string
): Promise<CIConfig> => {
  const configFilePath = path.join(jobDirectory, CI_FILE_NAME);
  const content = await readFile(configFilePath, "utf-8");
  if (!content) throw new Error("Could not read config file");
  return JSON.parse(content.toString());
};
