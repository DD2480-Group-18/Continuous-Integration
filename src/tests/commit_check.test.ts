import { setCommitStatus } from "../pkg/commit_check";

test("setCommitStatus sets correct pending status", async () => {
  const succeeded = await setCommitStatus(
    "DD2480-Group-18",
    "Continuous-Integration",
    "6bf76c8b4f8444b48de5dbbf1ad19cf400e67e99",
    { state: "pending" }
  );
  expect(succeeded).toBe(true);
});

test("setCommitStatus does not set pending status for invalid status update URL", async () => {
  const succeeded = await setCommitStatus(
    "DD2480-Group-18",
    "Continuous-Integration",
    "invalid-sha-blabla",
    { state: "pending" }
  );
  expect(succeeded).toBe(false);
});

test("setCommitStatus sets correct failure status", async () => {
  const succeeded = await setCommitStatus(
    "DD2480-Group-18",
    "Continuous-Integration",
    "6bf76c8b4f8444b48de5dbbf1ad19cf400e67e99",
    { state: "failure" }
  );
  expect(succeeded).toBe(true);
});

test("setCommitStatus does not set failure status for invalid status update URL", async () => {
  const succeeded = await setCommitStatus(
    "DD2480-Group-18",
    "Continuous-Integration",
    "invalid-sha-blabla",
    { state: "success" }
  );
  expect(succeeded).toBe(false);
});

test("setCommitStatus sets correct success status", async () => {
  const succeeded = await setCommitStatus(
    "DD2480-Group-18",
    "Continuous-Integration",
    "6bf76c8b4f8444b48de5dbbf1ad19cf400e67e99",
    { state: "success" }
  );
  expect(succeeded).toBe(true);
});

test("setCommitStatus does not set success status for invalid status update URL", async () => {
  const succeeded = await setCommitStatus(
    "DD2480-Group-18",
    "Continuous-Integration",
    "invalid-sha-blabla",
    { state: "success" }
  );
  expect(succeeded).toBe(false);
});
