import path from "path";
import fs from "fs";
import { JOB_FILE_DIR } from "../constants/constants";
import { cloneRepository, createDirectory } from "../pkg/ci";

test("createJobDirectory creates the folder structure on the filesystem", async () => {
  const ownerName = "test-owner";
  const repositoryName = "test-repository";
  const commitHash = "abc123";

  // not using getRootDirectory because jest does not support es modules (which that function uses)
  const jobDirectory = path.join(
    __dirname,
    "../../",
    `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`
  );

  // clear previous entries of this test directory
  fs.rmSync(jobDirectory, { recursive: true, force: true });
  // create the test directory
  await createDirectory(jobDirectory);

  let exists: boolean;
  try {
    exists = Boolean(fs.statSync(jobDirectory));
  } catch (_) {
    exists = false;
  }

  expect(exists).toBe(true);

  // clear test directory
  fs.rmSync(jobDirectory, { recursive: true, force: true });
});

test("cloneRepository clones repositories to the target directory", async () => {
  const sshURL = "git@github.com:DD2480-Group-18/Continuous-Integration.git";
  const branchRef = "refs/heads/master";
  const ownerName = "DD2480-Group-18";
  const repositoryName = "Continuous-Integration";
  const commitHash = "abc123";

  // not using getRootDirectory because jest does not support es modules (which that function uses)
  const intoDirectory = path.join(
    __dirname,
    "../../",
    `${JOB_FILE_DIR}/${ownerName}-${repositoryName}-${commitHash}`
  );

  // clear previous entries of the test directory
  fs.rmSync(intoDirectory, { recursive: true, force: true });

  // create the test directory to clone the repository into
  await createDirectory(intoDirectory);

  // create a clone of the repository in the test directory
  await cloneRepository(sshURL, branchRef, intoDirectory);

  let exists: boolean;
  try {
    // check if .git folder exists (must exist if repository was cloned)
    exists = Boolean(fs.statSync(path.join(intoDirectory, ".git")));
  } catch (_) {
    exists = false;
  }

  expect(exists).toBe(true);

  // clear test directory
  fs.rmSync(intoDirectory, { recursive: true, force: true });
});
