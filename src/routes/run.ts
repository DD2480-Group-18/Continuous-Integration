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
  await createJobMetaData(loggingDirectory, {
    username,
    commitURL,
    commitTimestamp,
    jobTimestamp,
  });

  // set commit status to pending
  const commitStatusURL = getCommitStatusUpdateURL(
    ownerName,
    repositoryName,
    commitHash
  );
  await setPendingCommitStatus(commitStatusURL);

  // clone repository
  await execute("--- ⬇️ CLONING REPOSITORY ⬇️ ---", logger);
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
  await execute("--- ✅ DONE CLONING REPOSITORY ✅ ---\n", logger);

  // read .ci.json configuration file and run the user-defined steps
  const { dependencies, compile, test } = await getRepositoryConfig(
    jobDirectory
  );

  const ciStartTime = performance.now();

  // run dependency installation steps
  await execute("--- 📦 INSTALLING DEPENDENCIES 📦 ---", logger);
  for (const cmd of dependencies) {
    await execute(cmd, logger, {
      encoding: "utf8",
      cwd: jobDirectory,
    });
  }
  await timedFinishLog("DONE INSTALLING DEPENDENCIES", ciStartTime, logger);

  // run compilation steps
  await execute("--- ⚙️ COMPILING PROJECT ⚙️ ---", logger);
  for (const cmd of compile) {
    await execute(cmd, logger, {
      encoding: "utf8",
      cwd: jobDirectory,
    });
  }
  await timedFinishLog("DONE COMPILING PROJECT", ciStartTime, logger);

  // run testing steps
  await execute("--- 🧪 RUNNING TESTS 🧪 ---", logger);
  for (const cmd of test) {
    await execute(cmd, logger, {
      encoding: "utf8",
      cwd: jobDirectory,
    });
  }
  await timedFinishLog("DONE RUNNING TESTS", ciStartTime, logger);

  // cleanup build files
  const rmCommand = `rm -rf "${jobDirectory}"`;
  await execute(rmCommand);

  //
  await execute("--- ✅ All CI steps completed successfully ✅  ---\n", logger);

  // Set CI commit status to "success"
  await setSuccessCommitStatus(commitStatusURL);
};

const timedFinishLog = async (
  message: string,
  startTime: number,
  logger: Console
) => {
  const s = (performance.now() - startTime) / 1000;
  await execute(`--- ✅ ${message} in ${s} seconds ✅ ---\n`, logger);
};
