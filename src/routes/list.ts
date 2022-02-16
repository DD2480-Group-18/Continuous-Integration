import { getRootDirectory } from "./../pkg/file";
import { RESULTS_FILE_DIR } from "./../constants/constants";
import { Request, Response } from "express";
import dirTree from "directory-tree";
import path from "path";

const CI_RESULTS_DIRECTORY = path.join(getRootDirectory(), RESULTS_FILE_DIR);

export const listJobs = async (req: Request, res: Response) => {
  const { children: jobOrganizations } = dirTree(CI_RESULTS_DIRECTORY, {
    normalizePath: true,
  });

  if (!jobOrganizations) {
    res.status(500);
    res.send("500: Failed to read CI results directory");
    return;
  }

  const jobsList = jobOrganizations.flatMap((jobOrganization) => {
    const organizationName = jobOrganization.name;
    if (!jobOrganization.children || jobOrganization.children?.length < 1) {
      return [];
    }
    const jobRepository = jobOrganization.children[0];
    const repositoryName = jobRepository.name;

    if (!jobRepository.children || jobRepository.children?.length < 1) {
      return [];
    }

    const jobCommitHash = jobRepository.children[0];
    const commitHashName = jobCommitHash.name;

    const jobURL = `/job/${organizationName}/${repositoryName}/${commitHashName}`;

    

    return {
      owner: organizationName,
      repository: repositoryName,
      sha: commitHashName,
      url: jobURL,
    };
  });

  console.log(jobsList);
  res.render("list", { jobs: jobsList });
};
