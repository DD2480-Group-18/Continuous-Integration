import {
  getCommitStatusUpdateURL,
  setFailureCommitStatus,
  setPendingCommitStatus,
  setSuccessCommitStatus,
} from "../pkg/commit_check";

const TIMEOUT = 10 * 750; // 7.5s timeout
jest.setTimeout(TIMEOUT);

test("getCommitStatusUpdateURL creates URLs correctly", () => {
  expect(getCommitStatusUpdateURL("ZinoKader", "portal", "123")).toBe(
    "https://api.github.com/repos/ZinoKader/portal/statuses/123"
  );
});

/* TEST PENDING COMMIT STATUS */
test("setPendingCommitStatus sets correct pending status", async () => {
  const updateURL = getCommitStatusUpdateURL(
    "DD2480-Group-18",
    "Continuous-Integration",
    "6bf76c8b4f8444b48de5dbbf1ad19cf400e67e99"
  );
  const succeeded = await setPendingCommitStatus(updateURL);
  expect(succeeded).toBe(true);
});

test("setPendingCommitStatus does not set pending status for invalid status update URL", async () => {
  const updateURL = getCommitStatusUpdateURL(
    "DD2480-Group-18",
    "Continuous-Integration",
    "invalid-sha-blabla"
  );
  const succeeded = await setPendingCommitStatus(updateURL);
  expect(succeeded).toBe(false);
});
/* END TEST PENDING COMMIT STATUS */

/* TEST FAILURE COMMIT STATUS */
test("setFailureCommitStatus sets correct failure status", async () => {
  const updateURL = getCommitStatusUpdateURL(
    "DD2480-Group-18",
    "Continuous-Integration",
    "6bf76c8b4f8444b48de5dbbf1ad19cf400e67e99"
  );
  const succeeded = await setFailureCommitStatus(updateURL);
  expect(succeeded).toBe(true);
});

test("setFailureCommitStatus does not set failure status for invalid status update URL", async () => {
  const updateURL = getCommitStatusUpdateURL(
    "DD2480-Group-18",
    "Continuous-Integration",
    "invalid-sha-blabla"
  );
  const succeeded = await setSuccessCommitStatus(updateURL);
  expect(succeeded).toBe(false);
});
/* END TEST SUCCESS COMMIT STATUS */

/* TEST SUCCESS COMMIT STATUS */
test("setSuccessCommitStatus sets correct success status", async () => {
  const updateURL = getCommitStatusUpdateURL(
    "DD2480-Group-18",
    "Continuous-Integration",
    "6bf76c8b4f8444b48de5dbbf1ad19cf400e67e99"
  );
  const succeeded = await setSuccessCommitStatus(updateURL);
  expect(succeeded).toBe(true);
});

test("setSuccessCommitStatus does not set success status for invalid status update URL", async () => {
  const updateURL = getCommitStatusUpdateURL(
    "DD2480-Group-18",
    "Continuous-Integration",
    "invalid-sha-blabla"
  );
  const succeeded = await setSuccessCommitStatus(updateURL);
  expect(succeeded).toBe(false);
});
/* END TEST SUCCESS COMMIT STATUS */
