import path from "path";
import { getRootDirectory } from "./pkg/file";
import {
  createJobDirectory,
  cloneRepository,
  getRepositoryConfig,
} from "./pkg/ci";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { WebhookBody } from "./types/types";
import { setSuccessCommitStatus } from "./pkg/commit_check";
import {
  getCommitStatusUpdateURL,
  setPendingCommitStatus,
} from "./pkg/commit_check";
import { PORT, JOB_FILE_DIR } from "./constants/constants";

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

  const commitStatusURL = getCommitStatusUpdateURL(
    ownerName,
    repositoryName,
    commitHash
  );
  const jobDirectory = path.join(
    getRootDirectory(),
    `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`
  );

  // Set CI commit status to "pending"
  await setPendingCommitStatus(commitStatusURL);

  createJobDirectory(jobDirectory);
  cloneRepository(sshURL, branchRef, jobDirectory);

  // read .ci.json configuration file and run the user-defined steps
  const ciConfig = await getRepositoryConfig(jobDirectory);

  /*
  // run dependency installation steps
  dependencies.forEach((cmd) =>
    executeAndLogCommand(cmd, CMD_EXEC_OPTIONS, absoluteJobDirectory)
  );
  // run compilation steps
  compile.forEach((cmd) =>
    executeAndLogCommand(cmd, CMD_EXEC_OPTIONS, absoluteJobDirectory)
  );
  // run testing steps
  test.forEach((cmd) =>
    executeAndLogCommand(cmd, CMD_EXEC_OPTIONS, absoluteJobDirectory)
  );

  // cleanup build files
  const rmCommand = `rm -rf "${absoluteJobDirectory}"`;
  executeAndLogCommand(rmCommand, CMD_EXEC_OPTIONS);
  */

  // Set CI commit status to "success"
  await setSuccessCommitStatus(commitStatusURL);
});

app.listen(PORT, function () {
  console.log(`CI Server is running on PORT: ${PORT}`);
});
