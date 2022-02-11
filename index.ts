import express, { Request, Response } from "express";
import bodyParser from "body-parser"
import { CIConfig, WebhookBody } from "./types";
import { executeAndLogCommand } from "./tools";
import { readFile } from 'fs/promises';

const app = express();
app.use(bodyParser.json())

const PORT = 80;
const CMD_EXEC_OPTIONS = [0, 1, 2]
const JOB_FILE_DIR = "ci-jobs"

app.post("/run", async (req: Request, res: Response) => {
  const {
    ssh_url,
    name: repositoryName,
    owner: {
      name: ownerName
    },
    ref: branchRef
  }: WebhookBody = req.body
  
  // extract the clean branch name of the commit
  const branch = branchRef.substring("refs/heads/".length)

  const jobDirectory = `${JOB_FILE_DIR}/${ownerName}-${repositoryName}`

  // create and enter parent and job directory (if not existing)
  const createDirsCommand = `mkdir -p ${jobDirectory} && cd ${jobDirectory}`
  executeAndLogCommand(createDirsCommand, CMD_EXEC_OPTIONS);

  // clone repository into current directory
  const cloneCommand = `git clone ${ssh_url} --branch ${branch} .`
  executeAndLogCommand(cloneCommand, CMD_EXEC_OPTIONS);
  
  // read .ci.json configuration file and run the user-defined steps
  const ciConfigFileBuffer = await readFile(jobDirectory);
  if (!ciConfigFileBuffer) {
    res.status(500);
    return;
  }
  const { dependencies, compile, test }: CIConfig = JSON.parse(ciConfigFileBuffer.toString())

  // run dependency installation steps
  dependencies.forEach((cmd) => executeAndLogCommand(cmd, CMD_EXEC_OPTIONS))
  // run compilation steps
  compile.forEach((cmd) => executeAndLogCommand(cmd, CMD_EXEC_OPTIONS))
  // run testing steps
  test.forEach((cmd) => executeAndLogCommand(cmd, CMD_EXEC_OPTIONS))
});

app.listen(PORT, function () {
  console.log(`CI Server is running on PORT: ${PORT}`);
});
