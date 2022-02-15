CIJOE

1.1 What is it?

CIJOE is a state-of-the-art CI build server for GitHub. Using the GitHub WebHooks integrations CIJOE makes sure that all code published to a repository is functional and sound.

1.2 How it works

1.3 How to use it

Create a CI configuration file `.ci.json`.

Example:

```json
// .ci.json

{
  "dependencies": ["echo 'dependency foo'", "echo 'dependency bar'"],
  "compile": ["echo 'compile foo'", "echo 'compile bar'"],
  "test": ["echo 'test foo'"]
}
```

Second example:

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
  "test": ["npm test"]
}
```

Download and run `ngrok`, a localhost tunneling service.

Create a webhook in your GitHub repository that connects to the generated ngrok tunnel address.

Run the CI server with `npm run build && npm start`.

Pushing changes onto remote from a local branch will trigger the webhook, which will send a request to the CI server. The CI server will pull the changes from that branch, build the latest revision, and try to run the tests.
 
1.4 Statement of contributions

Adam: Everything docker-related, README.md, pair programming with Zino.
Zino: Most of the CI server implementation. 
 
