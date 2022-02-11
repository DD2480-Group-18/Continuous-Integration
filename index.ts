import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  CheckRunBody,
  CIConfig,
  CommitCheckOutput,
  WebhookBody,
} from "./types";
import { executeAndLogCommand } from "./tools";
import { readFile } from "fs/promises";
import path = require("path");
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// config
const PORT = 80;
const CMD_EXEC_OPTIONS = [0, 1, 2];
const JOB_FILE_DIR = "ci-jobs";
const CI_FILE_NAME = ".ci.json";

app.post("/run", async (req: Request, res: Response) => {
  const {
    repository: {
      ssh_url,
      name: repositoryName,
      owner: { name: ownerName },
    },
    after: commitHash,
    ref: branchRef,
  }: WebhookBody = req.body;

  const commit_check_url = `https://github.com/repos/${ownerName}/${repositoryName}/statuses/${branchRef}`;
  const commit_check_name = "code-coverage";
  const output: CommitCheckOutput = {
    title: "Code coverage",
    summary: "CI build using CIJOE",
  };

  try {
    // Set as in-progress
    const in_progress_body: CheckRunBody = {
      name: commit_check_name,
      head_sha: branchRef,
      output,
    };
    axios.post(commit_check_url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.github.v3+json",
      },
      body: JSON.stringify(in_progress_body),
    });

    // extract the clean branch name of the commit
    const branch = branchRef.substring("refs/heads/".length);

    const jobDirectory = `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`;

    // create and enter parent and job directory (if not existing)
    const createDirsCommand = `mkdir -p "${jobDirectory}"`;
    executeAndLogCommand(createDirsCommand, CMD_EXEC_OPTIONS);

    // clone repository into current directory
    const cloneCommand = `git clone ${ssh_url} . --branch ${branch}`;
    executeAndLogCommand(cloneCommand, CMD_EXEC_OPTIONS, jobDirectory);

    // read .ci.json configuration file and run the user-defined steps
    const absoluteJobDirectory = path.resolve(__dirname, jobDirectory);
    const ciConfigFileBuffer = await readFile(
      path.join(absoluteJobDirectory, CI_FILE_NAME)
    );
    if (!ciConfigFileBuffer) {
      res.status(500);
      return;
    }
    const { dependencies, compile, test }: CIConfig = JSON.parse(
      ciConfigFileBuffer.toString()
    );

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

    // success
    const success_body: CheckRunBody = {
      name: commit_check_name,
      head_sha: branchRef,
      status: "completed",
      conclusion: "success",
      output,
    };
    await axios.post(commit_check_url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.github.v3+json",
      },
      body: JSON.stringify(success_body),
    });
  } catch (err) {
    console.error(err);

    // failure
    const failure_body: CheckRunBody = {
      name: commit_check_name,
      head_sha: branchRef,
      status: "completed",
      conclusion: "failure",
      output,
    };
    await axios.post(commit_check_url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.github.v3+json",
      },
      body: JSON.stringify(failure_body),
    });
  }
});

app.listen(PORT, function () {
  console.log(`CI Server is running on PORT: ${PORT}`);
});
