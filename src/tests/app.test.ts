import axios from "axios";
import app from "../app";

beforeAll(() => {
  app.listen(3001);
});

jest.setTimeout(10 * 1000);

test("mock", async () => {
  // @ts-ignore
  const res = await axios.post("http://localhost:3001/run", {
    repository: {
      ssh_url: "git@github.com:DD2480-Group-18/Continuous-Integration.git",
      name: "Continuous-Integration",
      owner: {
        name: "DD2480-Group-18",
      },
    },
    head_commit: {
      timestamp: "2022-02-10T17:29:44-06:00",
      url: "https://github.com/DD2480-Group-18/Continuous-Integration/commit/9e234a3ed12f628e14ef5d23bf5ad67b5625f4d7",
      author: {
        username: "Adamih",
      },
    },
    after: "9e234a3ed12f628e14ef5d23bf5ad67b5625f4d7",
    ref: "refs/heads/t/dependencies-working",
  });

  expect(res?.status).toBe(200);
});
