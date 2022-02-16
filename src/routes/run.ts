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
  RESULTS_FILE_DIR,
} from "../constants/constants";
import fs from "fs";
import { execute } from "../pkg/io";
import { Console } from "console";
import path from "path";
import { getRootDirectory } from "../pkg/file";
import { finishedStatusLog, statusLog } from "../pkg/log";

/**
 * Runs the CI steps on a commit notification received by a GitHub webhook POST request
 */
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

  // set commit status to pending
  const commitStatusURL = getCommitStatusUpdateURL(
    ownerName,
    repositoryName,
    commitHash
  );
  await setPendingCommitStatus(commitStatusURL);

  // create a logger that logs to the job logging directory
  const loggingDirectory = path.join(
    getRootDirectory(),
    `${RESULTS_FILE_DIR}/${ownerName}/${repositoryName}/${commitHash}`
  );
  await createDirectory(loggingDirectory);
  const outputFileStream = fs.createWriteStream(
    `${loggingDirectory}/${OUTPUT_LOG_FILE_NAME}`
  );
  const logger = new Console({
    stdout: outputFileStream,
    stderr: outputFileStream,
  });

  // create job metadata in logging directory
  const jobTimestamp = new Date(Date.now()).toISOString();
  await createJobMetaData(loggingDirectory, {
    username,
    commitURL,
    commitTimestamp,
    jobTimestamp,
  });

  // clone repository
  const cloningStartTime = performance.now();
  statusLog("CLONING REPOSITORY", "⬇️", logger);
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
  finishedStatusLog("DONE CLONING REPOSITORY", "✅", cloningStartTime, logger);

  // read .ci.json configuration file and run the user-defined steps
  const { dependencies, compile, test } = await getRepositoryConfig(
    jobDirectory
  );

  const ciStartTime = performance.now();

  // run dependency installation steps
  statusLog("INSTALLING DEPENDENCIES", "📦", logger);
  for (const cmd of dependencies) {
    await execute(cmd, logger, {
      encoding: "utf8",
      cwd: jobDirectory,
    });
  }
  finishedStatusLog("DONE INSTALLING DEPENDENCIES", "✅", ciStartTime, logger);

  // run compilation steps
  let compileStartTime = performance.now();
  statusLog("COMPILING PROJECT", "⚙️", logger);
  for (const cmd of compile) {
    await execute(cmd, logger, {
      encoding: "utf8",
      cwd: jobDirectory,
    });
  }
  finishedStatusLog("DONE COMPILING PROJECT", "✅", compileStartTime, logger);

  // run testing steps
  let testingStartTime = performance.now();
  statusLog("RUNNING TESTS", "🧪", logger);
  for (const cmd of test) {
    await execute(cmd, logger, {
      encoding: "utf8",
      cwd: jobDirectory,
    });
  }
  finishedStatusLog("DONE RUNNING TESTS", "✅", testingStartTime, logger);

  // cleanup build files
  const rmCommand = `rm -rf "${jobDirectory}"`;
  await execute(rmCommand);

  // log success status
  finishedStatusLog(
    "All CI steps completed successfully",
    "✅",
    ciStartTime,
    logger
  );

  // set GitHub CI commit status to "success"
  await setSuccessCommitStatus(commitStatusURL);
};
