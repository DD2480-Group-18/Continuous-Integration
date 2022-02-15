# CI-JOE

## 1.1 What is it?

CIJOE is a state-of-the-art CI build server for GitHub. 
Using the GitHub WebHooks integrations CIJOE makes sure that all code published to a repository is functional and sound.

## 1.2 How it works

## 1.3 How to use it

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

### Setup the project with tunneling

1. Download and run `ngrok`, a localhost tunneling service.

2. Create a webhook in your GitHub repository that connects to the generated ngrok tunnel address.

3. Build and run the CI server with `npm run build` followed by `npm start`.

3. Pushing changes onto remote from a local branch will trigger the webhook, which will send a request to the CI server. The CI server will pull the changes from that branch, build the latest revision, and try to run the CI steps defined in `.ci.json`.

## 1.4 Statement of contributions

Adam: Everything docker-related, README.md, pair programming with Zino.

Zino: Most of the CI server implementation.
