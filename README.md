# CI-JOE

## 1.1 What is it?

CI-JOE is a state-of-the-art CI build server for GitHub.
Using the GitHub WebHooks integrations CI-JOE makes sure that all code published to a repository is functional and sound.

## 1.2 How it works

#### CI-JOE creates snapshots of the commits made to the repository in a folder structure on the filesystem where CI-JOE is run.

The relevant folders are:

```
├── ci-jobs
├── ci-results
```

- `ci-jobs` contains the cloned repositories that the CI steps are ran on
- `ci-results` contains metadata from the results of running the CI steps

#### CI-JOE reports commit CI status back to GitHub

The notification system works by utilizing GitHub's webhook mechanism on repository pushes. When a commit is pushed to the repository, CI-JOE will run the CI steps for it and report back when the CI is running, and whether it completed sucessfully or failed.

This reporting mechanism is tested using unit tests that run against a specific commit on a specific branch of this project.

#### CI-JOE runs your compilation steps and reports back

Compilation is triggered using the webhook mechanism, in which the steps defined in your `.ci.json` file in the `compile` property/list are run on the CI server. Everything you can do in a bash shell is possible to do here. `compile` is a list in which you can specify multiple compilation-related commands in the order you want them executed.

The compilation mechanism is tested in integration tests where broken projects and functional projects are tested to see if the CI results report back the expected result.

#### CI-JOE runs your testing steps and reports back

Testing is triggered using the webhook mechanism, in which the steps defined in your `.ci.json` file in the `test` property/list are run on the CI server. Everything you can do in a bash shell is possible to do here. `test` is a list in which you can specify multiple testing-related commands in the order you want them executed.

The testing mechanism is tested in integration tests where projects with failing tests and projects with passing tests are tested to see if the CI results report back the expected result.

## 1.3 How to use it

### Available endpoints

- `/run` takes POST requests from GitHub's webhook mechanism.
- `/list` shows a list of the history of CI jobs
- `/job/<organization>/<repository>/<commit-sha>` shows detailed running logs of a CI job (accessible by clicking a link from `/list`).

### Available commands

- `npm run build` builds the project
- `npm run watch` re-builds the project continuously as file changes occur
- `npm run start` starts the server from the compiled/built files (build first!)
- `npm run test` runs all tests in the project
- `npm run clean` cleans compiled/built files
- `npm run clean-jobs` cleans `ci-jobs` and `ci-results` directories which keeps logs of project build history
- `npm run fresh-start` is a useful combination of `clean`, `build` and `start`, in that order.
- `npm run documentation` generates project documentation and serves it

### Setup your GitHub CI token

For CI-JOE to have access to your repository, you need to setup the environment variable `GITHUB_CI_ACCESS_TOKEN` in .env or run the executable with the same environment variable set.
The access token only needs the `repo:status` permission.

You can create and retrieve your CI token [here](https://github.com/settings/tokens).

##### Create a `.env` file in the top project directory with the following content:

```
// .env

GITHUB_CI_ACCESS_TOKEN=your-github-access-token
```

### Create a CI configuration file `.ci.json`.

This configuration file contains all of the CI steps that will be run by CI-JOE.
The available fields are `dependencies`, `compile` and `test` and are all arrays of `bash` instructions to be run (in defined order) on the CI server.

### **Important!**

> **Notice that .ci.json contains a hack to include the GitHub CI access token. This is required in order for the tests on the cloned repository to be run correctly (as they require the access token).**

#### `dependencies`

These steps will be run first and as the name indicates, will typically be installation of dependencies and other setup to make the project work.

#### `compile`

These steps are run iff. the steps in `dependencies` have all finished without errors.
These steps should be related to the compilation of the project.

#### `test`

These steps are run last iff. the steps in `compile` have all finished without errors.
These steps should be related to testing of the project.

#### Example `.ci.json` configuration

```json
// .ci.json

{
  "dependencies": [
    "sudo apt-get install git",
    "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash", // install NVM
    "nvm install --lts",
    "npm install"
  ],
  "compile": ["npm run build"],
  "test": ["npm run test"]
}
```

### Setup the project's webhook capabilities with tunneling

1. Download and run `ngrok`, a localhost tunneling service. Run it for port 3000 with `ngrok http 3000`.

2. Create a webhook in your GitHub repository that connects to the generated ngrok tunnel address. Be sure to run it against the `/run` endpoint. For instance, if your `ngrok` address is `https://241d-96-63-212-81.ngrok.io`, you would point the webhook to `https://241d-96-63-212-81.ngrok.io/run`.

3. Build and run the CI server with `npm run build` followed by `npm run start`.

4. Pushing changes onto remote from a local branch will trigger the webhook, which will send a POST request to the CI server. The CI server will pull the changes from that branch, build the latest revision, and try to run the CI steps defined in `.ci.json`.

## 1.4 Statement of contributions

Adam: Everything README.md, pair programming with Zino, endpoint test, logging.

Zino: Most of the CI server implementation. Also commit check handling, endpoints with views, file handling, documentation and most tests.

Oskar: ci-tests, pair programming with Adam.

#### Something we are proud of

We have created our own .ci.json format which we use to run the bash-script steps in order. We think it's pretty cool, and it works well!

## 1.5 Essence Documentation

Our team is still somewhere between seeded and formed.

What speaks for being in seeded:

- Group members do not always understand the obligation towards their team members to be available and do their work, therefore the _level of team commitment_ is not clear.
- The responsibilities of the team members are outlined, but are not used/applied in practice.
- The composition of the team is defined (the team was formed by an external part).

What speaks for being in formed:

- For some members, _individual responsibilities are understood_.
- It is true that _enough team members have been recruited to enable the work to progress_.
- The team members have met virtually and are beginning to get to know each other (although the entire team has never met at once).
- Team communication mechanisms have been formed (Discord), although the communication does not always spark a response.

To be able to fully identify as _formed_, the team members would need to primarily take on more personal responsibility.
Moreover, each team member needs to commit to working as defined, that is, to do approximately equal amounts of work.
Other than these points, the unfulfilled points in "what speaks for being in seeded" need to be fully resolved.

## 1.6 P+ features description

### History of past builds

This is documented throughout the project documentation, but in short it can be viewed at `/list` when running the CI server.

### Most commits are linked to an issue describing the feature/commit

Yes, we have used git-flow to work with git, and have made sure to almost always use pull requests with clearly linked issues.
To merge into master, we squash commits and also link to the issue in the commit comment,
as well as listing the changes from the individual commits that make up the squashed commit.

### The group is creative and proactive

See the statement of contributions for the "Something we are proud of" section
