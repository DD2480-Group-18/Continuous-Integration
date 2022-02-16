import { JobMetadata } from "./../types/types";
import fs from "fs";
import { getRootDirectory } from "./../pkg/file";
import {
  METADATA_FILE_NAME,
  OUTPUT_LOG_FILE_NAME,
  RESULTS_FILE_DIR,
} from "./../constants/constants";
import { Request, Response } from "express";
import path from "path";

const CI_RESULTS_DIRECTORY = path.join(getRootDirectory(), RESULTS_FILE_DIR);

/**
 * Shows details of a previously ran CI job at /job/<owner>/<repository>/<commit-sha>
 */
export const showJob = async (req: Request, res: Response) => {
  const organizationName = req.params.organization;
  const repositoryName = req.params.repository;
  const commitHash = req.params.sha;

  const jobResultsDirectory = path.join(
    CI_RESULTS_DIRECTORY,
    organizationName,
    repositoryName,
    commitHash
  );

  let metadataFile;
  try {
    metadataFile = fs.readFileSync(
      path.join(jobResultsDirectory, METADATA_FILE_NAME),
      "utf-8"
    );
  } catch (err) {
    const errorMessage = `Failed to load metadata file for organization/repository/commit (${organizationName}/${repositoryName}/${commitHash})`;
    console.error(errorMessage, err);
    res.status(500);
    res.send(errorMessage);
    return;
  }
  const metadata: JobMetadata = JSON.parse(metadataFile.toString());

  let outputLogFile;
  try {
    outputLogFile = fs.readFileSync(
      path.join(jobResultsDirectory, OUTPUT_LOG_FILE_NAME),
      "utf-8"
    );
  } catch (err) {
    const errorMessage = `Failed to load output-log file for organization/repository/commit (${organizationName}/${repositoryName}/${commitHash})`;
    console.error(errorMessage, err);
    res.status(500);
    res.send(errorMessage);
    return;
  }

  const outputLog = outputLogFile.toString();

  res.render("job", {
    outputLog,
    metadata,
    owner: organizationName,
    repository: repositoryName,
    sha: commitHash,
  });
};
