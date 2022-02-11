import 'dotenv/config'
import axios from 'axios';
import HttpStatusCode from '../types/status_codes';
import { CommitStatusUpdate } from '../types/types';

/**
 * Gets the URL of the commit status page
 * 
 * @param ownerName the owner of the repository
 * @param repositoryName the name of the repository
 * @param sha the SHA of the commit
 * @returns the URL of the commit status page
 */
export const getCommitStatusUpdateURL = (ownerName: string, repositoryName: string, sha: string) => 
   `https://api.github.com/repos/${ownerName}/${repositoryName}/statuses/${sha}`;


/**
 * Sets the GitHub commit status to "pending"
 * 
 * @param commitStatusURL the URL of the GitHub status page
 */
export const setPendingCommitStatus = async (commitStatusURL: string) => {
  const pendingBody: CommitStatusUpdate = { state: "pending", context: "ci-joe" };
  return setCommitStatus(commitStatusURL, pendingBody)
}

/**
 * Sets the GitHub commit status to "success"
 * 
 * @param commitStatusURL the URL of the GitHub status page
 */
 export const setSuccessCommitStatus = async (commitStatusURL: string) => {
  const successBody: CommitStatusUpdate = { state: "success", context: "ci-joe" };
  return setCommitStatus(commitStatusURL, successBody)
 }

 /**
 * Sets the GitHub commit status to "failure"
 * 
 * @param commitStatusURL the URL of the GitHub status page
 */
  export const setFailureCommitStatus = async (commitStatusURL: string) => {
    const failureBody: CommitStatusUpdate = { state: "failure", context: "ci-joe" };
    return setCommitStatus(commitStatusURL, failureBody)
  }

/**
 * Sets the GitHub commit status using a POST request
 * 
 * @param commitStatusURL the URL of the GitHub status page
 * @param body the body of the commit status update request
 * @returns true if the request successfully created a commit status
 */
const setCommitStatus = async (commitStatusURL: string, body: CommitStatusUpdate) => {
  const req = await axios
    .post(commitStatusURL, {
      method: "POST",
      headers: {
        "Authorization": `token ${process.env.GITHUB_CI_ACCESS_TOKEN}`,
        "Content-Type": "application/vnd.github.v3+json",
      },
      body: body
    })
  return req.status === HttpStatusCode.CREATED
}