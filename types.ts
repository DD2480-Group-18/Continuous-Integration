export type WebhookBody = {
  repository: {
    ssh_url: string;
    name: string;
    owner: {
      name: string;
    };
  };
  after: string;
  ref: string;
};

export type CIConfig = {
  dependencies: string[];
  compile: string[];
  test: string[];
};

export type CheckRunBody = {
  name: string;
  head_sha: string;
  details_url?: string;
  external_id?: string;
  status?: "queued" | "in_progress" | "completed";
  started_at?: string;
  conclusion?:
    | "action_required"
    | "cancelled"
    | "failure"
    | "neutral"
    | "success"
    | "skipped"
    | "stale"
    | "timed_out";
  completed_at?: string;
  output?: CommitCheckOutput;
};

export type CommitCheckOutput = {
  title: string;
  summary: string;
  text?: string;
  annotations?: CommitCheckAnnotation[];
  images?: CommitCheckImage[];
};

type CommitCheckAnnotation = {
  path: string;
  start_line: number;
  end_line: number;
  start_column?: number;
  end_column?: number;
  annotation_level: "notice" | "warning" | "failure";
  message: string;
  title?: string;
  raw_details: string;
};

type CommitCheckImage = {
  alt: string;
  image_url: string;
  caption?: string;
};
