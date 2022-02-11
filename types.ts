export type WebhookBody = {
  ssh_url: string,
  name: string,
  owner: {
    name: string
  },
  ref: string
}

export type CIConfig = {
  dependencies: string[],
  compile: string[],
  test: string[],
}