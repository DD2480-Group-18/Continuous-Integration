// dependencies
import path from "path";
import express, { Request, Response } from "express";
import { execSync } from "child_process";

const app = express();
app.use(express.json());

app.post("/", (req: Request, res: Response) => {
  // here you do all the continuous integration tasks
  // for example
  // 1st clone your repository

  const user = "DD2480-Group-18";
  const repo_name = "Continuous-Integration";
  const branch = "citest";

  const data = req.body;

  execSync(
    `git clone git@github.com:${user}/${repo_name}.git --branch ${branch}`,
    {
      stdio: [0, 1, 2], // we need this so node will print the command output
      cwd: path.resolve(__dirname, ""), // path to where you want to save the file
    }
  );

  console.log(
    `done: git clone git@github.com:${user}/${repo_name}.git --branch ${branch}`
  );

  execSync(`npx tsc --project ${repo_name}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: path.resolve(__dirname, ""), // path to where you want to save the file
  });

  console.log(`done: npx tsc ${repo_name}`);
});

var PORT = 80;
app.listen(PORT, function () {
  console.log(`Server is running on PORT: ${PORT}`);
  return;
});
