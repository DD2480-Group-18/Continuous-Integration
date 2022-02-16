import {
  createDirectory,
  cloneRepository,
  getRepositoryConfig,
  createJobMetaData,
} from "../pkg/ci";
import { Request, Response } from "express";
import { JobMetadata, WebhookBody } from "../types/types";
import {
  getCommitStatusUpdateURL,
  setFailureCommitStatus,
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

  // setup logging
  let logger;
  try {
    logger = await setupLogging({
      ownerName,
      repositoryName,
      commitHash,
      username,
      commitURL,
      commitTimestamp,
    });
  } catch (e) {
    await setFailureCommitStatus(commitStatusURL);
    return;
  }

  const jobDirectory = path.join(
    getRootDirectory(),
    `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`
  );

  try {
    // clone the repository
    await setupTargetRepository({
      jobDirectory,
      ownerName,
      repositoryName,
      commitHash,
      sshURL,
      branchRef,
      logger,
    });

    // read .ci.json configuration file and run the user-defined steps
    const { dependencies, compile, test } = await getRepositoryConfig(
      jobDirectory
    );
    const ciStartTime = performance.now();

    // run dependency installation steps
    await runCISteps({
      steps: dependencies,
      startTime: ciStartTime,
      jobDirectory,
      message: "INSTALLING DEPENDENCIES",
      symbol: "📦",
      logger,
    });

    // run compilation steps
    const compilationStartTime = performance.now();
    await runCISteps({
      steps: compile,
      startTime: compilationStartTime,
      jobDirectory,
      message: "COMPILING PROJECT",
      symbol: "⚙️",
      logger,
    });

    // run testing steps
    const testingStartTime = performance.now();
    await runCISteps({
      steps: test,
      startTime: testingStartTime,
      jobDirectory,
      message: "RUNNING TESTS",
      symbol: "🧪",
      logger,
    });

    // cleanup build files
    await execute(`rm -rf "${jobDirectory}"`);

    // log success status
    finishedStatusLog("CI completed successfully", "✅", ciStartTime, logger);

    // set GitHub CI commit status to "success"
    await setSuccessCommitStatus(commitStatusURL);
  } catch (e) {
    logger.log("CI-JOE failed: ", e);
    await setFailureCommitStatus(commitStatusURL);
    return res.sendStatus(500);
  }
  return res.sendStatus(200);
};

type RepositoryInfo = {
  ownerName: string;
  repositoryName: string;
  commitHash: string;
};

/**
 * Sets up logging infrastructure and returns a logger
 *
 * @param properties required to setup logging
 * @returns a logger that writes to a log file
 */
const setupLogging = async ({
  ownerName,
  repositoryName,
  commitHash,
  username,
  commitURL,
  commitTimestamp,
}: RepositoryInfo & Omit<JobMetadata, "jobTimestamp">) => {
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

  return logger;
};

/**
 * Sets up the folder structure for the CI job and clones the repository into it
 *
 * @param properties required to clone the target repository
 */
const setupTargetRepository = async ({
  jobDirectory,
  ownerName,
  repositoryName,
  commitHash,
  sshURL,
  branchRef,
  logger,
}: RepositoryInfo & {
  jobDirectory: string;
  sshURL: string;
  branchRef: string;
  logger: Console;
}) => {
  const cloningStartTime = performance.now();
  statusLog("CLONING REPOSITORY", "⬇️", logger);
  await createDirectory(jobDirectory);
  await cloneRepository(
    sshURL,
    branchRef,
    `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`
  );
  finishedStatusLog("DONE CLONING REPOSITORY", "✅", cloningStartTime, logger);
};

/**
 * Runs the CI steps in "steps" and logs status updates
 *
 * @param properties required to run the CI steps
 */
const runCISteps = async ({
  steps,
  startTime,
  jobDirectory,
  message,
  symbol,
  logger,
}: {
  message: string;
  symbol: string;
  logger: Console;
  steps: string[];
  jobDirectory: string;
  startTime: number;
}) => {
  // run dependency installation steps
  statusLog(message, symbol, logger);
  for (const cmd of steps) {
    await execute(cmd, logger, {
      encoding: "utf8",
      cwd: jobDirectory,
    }).catch((err) => {
      throw err;
    });
  }
  finishedStatusLog(`DONE ${message}`, "✅", startTime, logger);
};
