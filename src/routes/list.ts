import { JobMetadata } from "./../types/types";
import fs from "fs";
import { getRootDirectory } from "./../pkg/file";
import { METADATA_FILE_NAME, RESULTS_FILE_DIR } from "./../constants/constants";
import { Request, Response } from "express";
import dirTree from "directory-tree";
import path from "path";

const CI_RESULTS_DIRECTORY = path.join(getRootDirectory(), RESULTS_FILE_DIR);

export const listJobs = async (_: Request, res: Response) => {
  const { children: jobOrganizations } = dirTree(CI_RESULTS_DIRECTORY, {
    normalizePath: true,
  });

  if (!jobOrganizations) {
    res.status(500);
    res.send("500: Failed to read CI results directory");
    return;
  }

  const jobsList = jobOrganizations
    .flatMap((jobOrganization) => {
      const organizationName = jobOrganization.name;
      if (!jobOrganization.children || jobOrganization.children?.length < 1) {
        console.error(
          `Failed to fetch repositories for organization (${organizationName})`
        );
        return [];
      }
      const jobRepository = jobOrganization.children[0];
      const repositoryName = jobRepository.name;

      if (!jobRepository.children || jobRepository.children?.length < 1) {
        console.error(
          `Failed to fetch commits for organization/repository (${organizationName}/${repositoryName})`
        );
        return [];
      }

      return jobRepository.children.flatMap((jobCommitHash) => {
        const commitHashName = jobCommitHash.name;
        const jobURL = `/job/${organizationName}/${repositoryName}/${commitHashName}`;

        let metadataFile;
        try {
          metadataFile = fs.readFileSync(
            path.join(jobCommitHash.path, METADATA_FILE_NAME),
            "utf-8"
          );
        } catch (err) {
          console.error(
            `Failed to metadata file for organization/repository/commit (${organizationName}/${repositoryName}/${commitHashName})`
          );
          return [];
        }

        const { jobTimestamp }: JobMetadata = JSON.parse(
          metadataFile.toString()
        );

        return {
          jobTimestamp,
          owner: organizationName,
          repository: repositoryName,
          sha: commitHashName,
          url: jobURL,
        };
      });
    })
    .sort(
      (a, b) =>
        new Date(a.jobTimestamp).getTime() - new Date(b.jobTimestamp).getTime()
    );

  res.render("list", { jobs: jobsList });
};
