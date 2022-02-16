import {
  createDirectory,
  cloneRepository,
  getRepositoryConfig,
  createJobMetaData,
} from "../pkg/ci";
import { Request, Response } from "express";
import { WebhookBody } from "../types/types";
import {
  getCommitStatusUpdateURL,
  setPendingCommitStatus,
  setSuccessCommitStatus,
} from "../pkg/commit_check";
import {
  JOB_FILE_DIR,
  OUTPUT_LOG_FILE_NAME,
  ERROR_LOG_FILE_NAME,
  RESULTS_FILE_DIR,
} from "../constants/constants";
import fs from "fs";
import { execute } from "../pkg/io";
import { Console } from "console";
import path from "path";
import { getRootDirectory } from "../pkg/file";

export const runCI = async (req: Request, res: Response) => {
  const {
    repository: {
      ssh_url: sshURL,
      name: repositoryName,
      owner: { name: ownerName },
    },
    head_commit: {
      author: { username },
      url: commitURL,
      timestamp: commitTimestamp,
    },
    after: commitHash,
    ref: branchRef,
  }: WebhookBody = req.body;

  const jobTimestamp = new Date(Date.now()).toISOString();

  // make a new logger
  const loggingDirectory = path.join(
    getRootDirectory(),
    `${RESULTS_FILE_DIR}/${ownerName}/${repositoryName}/${commitHash}`
  );
  await createDirectory(loggingDirectory);
  await createJobMetaData(loggingDirectory, {
    username,
    commitURL,
    commitTimestamp,
    jobTimestamp,
  });
  const logger = new Console({
    stdout: fs.createWriteStream(`${loggingDirectory}/${OUTPUT_LOG_FILE_NAME}`),
    stderr: fs.createWriteStream(`${loggingDirectory}/${ERROR_LOG_FILE_NAME}`),
  });

  // Set commit status to pending
  const commitStatusURL = getCommitStatusUpdateURL(
    ownerName,
    repositoryName,
    commitHash
  );
  await setPendingCommitStatus(commitStatusURL);

  // Clone repository
  const jobDirectory = path.join(
    getRootDirectory(),
    `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`
  );
  await createDirectory(jobDirectory);
  await cloneRepository(
    sshURL,
    branchRef,
    `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`
  );

  // read .ci.json configuration file and run the user-defined steps
  const { dependencies, compile, test } = await getRepositoryConfig(
    jobDirectory
  );

  // run dependency installation steps
  for (const cmd of dependencies) {
    await execute(
      cmd,
      {
        encoding: "utf8",
        cwd: jobDirectory,
      },
      logger
    );
  }

  // run compilation steps
  for (const cmd of compile) {
    await execute(
      cmd,
      {
        encoding: "utf8",
        cwd: jobDirectory,
      },
      logger
    );
  }
  // run testing steps
  for (const cmd of test) {
    await execute(
      cmd,
      {
        encoding: "utf8",
        cwd: jobDirectory,
      },
      logger
    );
  }

  // cleanup build files
  const rmCommand = `rm -rf "${jobDirectory}"`;
  await execute(rmCommand, { encoding: "utf8" });

  // Set CI commit status to "success"
  await setSuccessCommitStatus(commitStatusURL);
};
