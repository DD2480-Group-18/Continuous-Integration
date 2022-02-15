import "dotenv/config";
import axios, { AxiosError } from "axios";
import HttpStatusCode from "../types/status_codes";
import { CommitStatusUpdate } from "../types/types";

/**
 * Sets the GitHub commit status using a POST request
 *
 * @param commitStatusURL the URL of the GitHub status page
 * @param body the body of the commit status update request
 * @returns true if the request successfully created a commit status
 */
export const setCommitStatus = async (
  ownerName: string,
  repositoryName: string,
  sha: string,
  body: CommitStatusUpdate
) => {
  const req = await axios
    .post(
      `https://api.github.com/repos/${ownerName}/${repositoryName}/statuses/${sha}`,
      body,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_CI_ACCESS_TOKEN}`,
          "Content-Type": "application/vnd.github.v3+json",
        },
      }
    )
    .catch((err) => {
      const error = err as AxiosError;
      const response = error.response;
      console.log(
        `Commit status update request failed with error code ${response?.status}`
      );
    });
  return Boolean(req && req.status === HttpStatusCode.CREATED);
};
