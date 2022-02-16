import fs from "fs";
import axios from "axios";
import { Server } from "http";
import path from "path";
import app from "../app";
import { JOB_FILE_DIR } from "../constants/constants";

const TEST_PORT = 3001;
const TIMEOUT = 100 * 1000; // 100s timeout
let server: Server;

jest.setTimeout(TIMEOUT);

beforeAll(() => {
  server = app.listen(TEST_PORT);
});

afterAll(() => {
  server.close();
});

test("Test CI against a repository with **working** dependencies, compilation and tests", async () => {
  // not using getRootDirectory because jest does not support es modules (which that function uses)
  // clear previous entries of this test directory
  fs.rmSync(
    path.join(
      __dirname,
      "../../",
      `${JOB_FILE_DIR}/DD2480-Group-18-Continuous-Integration-eaca9bd4052cb32f8a8e51c21fbf370ce4810c06`
    ),
    { recursive: true, force: true }
  );

  const res = await axios.post(`http://localhost:${TEST_PORT}/run`, {
    repository: {
      ssh_url: "git@github.com:DD2480-Group-18/Continuous-Integration.git",
      name: "Continuous-Integration",
      owner: {
        name: "DD2480-Group-18",
      },
    },
    head_commit: {
      timestamp: "2022-02-10T17:29:44-06:00",
      url: "https://github.com/DD2480-Group-18/Continuous-Integration/commit/eaca9bd4052cb32f8a8e51c21fbf370ce4810c06",
      author: {
        username: "Adamih",
      },
    },
    after: "eaca9bd4052cb32f8a8e51c21fbf370ce4810c06",
    ref: "refs/heads/t/working-project",
  });

  expect(res?.status).toBe(200);
});

test("Test CI against a repository with **broken** dependencies", async () => {
  // not using getRootDirectory because jest does not support es modules (which that function uses)
  // clear previous entries of this test directory
  fs.rmSync(
    path.join(
      __dirname,
      "../../",
      `${JOB_FILE_DIR}/DD2480-Group-18-Continuous-Integration-e35e72e978be767cd997c4615b7e8c100b269f78`
    ),
    { recursive: true, force: true }
  );

  const res = await axios
    .post(`http://localhost:${TEST_PORT}/run`, {
      repository: {
        ssh_url: "git@github.com:DD2480-Group-18/Continuous-Integration.git",
        name: "Continuous-Integration",
        owner: {
          name: "DD2480-Group-18",
        },
      },
      head_commit: {
        timestamp: "2022-02-10T17:29:44-06:00",
        url: "https://github.com/DD2480-Group-18/Continuous-Integration/commit/e35e72e978be767cd997c4615b7e8c100b269f78",
        author: {
          username: "ZinoKader",
        },
      },
      after: "e35e72e978be767cd997c4615b7e8c100b269f78",
      ref: "refs/heads/t/dependencies-broken",
    })
    .catch((err) => err);

  const is200 = res?.status === 200;
  expect(is200).toBe(false);
});

test("Test CI against a repository with **broken** compilation", async () => {
  // not using getRootDirectory because jest does not support es modules (which that function uses)
  // clear previous entries of this test directory
  fs.rmSync(
    path.join(
      __dirname,
      "../../",
      `${JOB_FILE_DIR}/DD2480-Group-18-Continuous-Integration-3b1fa4eed6dcfd1d8d3142c2f6181e16f78b4915`
    ),
    { recursive: true, force: true }
  );

  const res = await axios
    .post(`http://localhost:${TEST_PORT}/run`, {
      repository: {
        ssh_url: "git@github.com:DD2480-Group-18/Continuous-Integration.git",
        name: "Continuous-Integration",
        owner: {
          name: "DD2480-Group-18",
        },
      },
      head_commit: {
        timestamp: "2022-02-10T17:29:44-06:00",
        url: "https://github.com/DD2480-Group-18/Continuous-Integration/commit/3b1fa4eed6dcfd1d8d3142c2f6181e16f78b4915",
        author: {
          username: "ZinoKader",
        },
      },
      after: "3b1fa4eed6dcfd1d8d3142c2f6181e16f78b4915",
      ref: "refs/heads/t/compilation-broken",
    })
    .catch((err) => err);

  const is200 = res?.status === 200;
  expect(is200).toBe(false);
});

test("Test CI against a repository with **broken** testing", async () => {
  // not using getRootDirectory because jest does not support es modules (which that function uses)
  // clear previous entries of this test directory
  fs.rmSync(
    path.join(
      __dirname,
      "../../",
      `${JOB_FILE_DIR}/DD2480-Group-18-Continuous-Integration-b07188a0ddd5b63675de03d1e6c7678746daa864`
    ),
    { recursive: true, force: true }
  );

  const res = await axios
    .post(`http://localhost:${TEST_PORT}/run`, {
      repository: {
        ssh_url: "git@github.com:DD2480-Group-18/Continuous-Integration.git",
        name: "Continuous-Integration",
        owner: {
          name: "DD2480-Group-18",
        },
      },
      head_commit: {
        timestamp: "2022-02-10T17:29:44-06:00",
        url: "https://github.com/DD2480-Group-18/Continuous-Integration/commit/b07188a0ddd5b63675de03d1e6c7678746daa864",
        author: {
          username: "ZinoKader",
        },
      },
      after: "b07188a0ddd5b63675de03d1e6c7678746daa864",
      ref: "refs/heads/t/testing-broken",
    })
    .catch((err) => err);

  const is200 = res?.status === 200;
  expect(is200).toBe(false);
});
