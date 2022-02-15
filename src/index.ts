import {
  createDirectory,
  cloneRepository,
  getRepositoryConfig,
} from "./pkg/ci";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { WebhookBody } from "./types/types";
import { setCommitStatus } from "./pkg/commit_check";
import { PORT, JOB_FILE_DIR, RESULTS_FILE_DIR } from "./constants/constants";
import fs from "fs";
import { execute } from "./pkg/io";
import { Console } from "console";

// initialize app
const app = express();

// use bodyParser middleware to parse JSON
app.use(bodyParser.json());

app.post("/run", async (req: Request, res: Response) => {
  const {
    repository: {
      ssh_url: sshURL,
      name: repositoryName,
      owner: { name: ownerName },
    },
    after: commitHash,
    ref: branchRef,
  }: WebhookBody = req.body;

  // Set CI commit status to "pending"
  await setCommitStatus(ownerName, repositoryName, commitHash, {
    state: "pending",
  });

  // make a new logger
  const loggingDirectory = `${RESULTS_FILE_DIR}/${ownerName}/${repositoryName}/${branchRef}`;
  createDirectory(loggingDirectory);
  const logger = new Console({
    stdout: fs.createWriteStream(`${loggingDirectory}/out.log`),
    stderr: fs.createWriteStream(`${loggingDirectory}/err.log`),
  });

  // Clone repository
  const jobDirectory = `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`;
  createDirectory(jobDirectory);
  cloneRepository(sshURL, branchRef, jobDirectory);

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
  await setCommitStatus(ownerName, repositoryName, commitHash, {
    state: "success",
  });
});

app.listen(PORT, function () {
  console.log(`CI Server is running on PORT: ${PORT}`);
});
