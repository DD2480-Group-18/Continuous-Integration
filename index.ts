// dependencies
import path from "path";
import express, { Request, Response } from "express";
import { execSync } from "child_process";

const app = express();
const PORT = 80;

app.post("/run", (req: Request, res: Response) => {

  console.log(req);
  console.log(JSON.stringify(req.body));

  const user = "DD2480-Group-18";
  const repo_name = "Continuous-Integration";
  const branch = "master";

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

  execSync(`cd ${repo_name}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: path.resolve(__dirname, ""), // path to where you want to save the file
  });

  console.log(`done: cd ${repo_name}`);

  execSync("npx tsc", {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: path.resolve(__dirname, ""), // path to where you want to save the file
  });

  console.log("done: npx tsc");
});

app.listen(PORT, function () {
  console.log(`CI Server is running on PORT: ${PORT}`);
});
