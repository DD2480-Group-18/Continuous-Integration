export type WebhookBody = {
  repository: {
    ssh_url: string,
    name: string,
    owner: {
      name: string
    },
  },
  after: string,
  ref: string
}

export type CIConfig = {
  dependencies: string[],
  compile: string[],
  test: string[],
}