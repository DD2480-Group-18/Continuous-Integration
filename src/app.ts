import { showJob } from "./routes/job";
import { getRootDirectory } from "./pkg/file";
import express from "express";
import bodyParser from "body-parser";
import { runCI } from "./routes/run";
import { listJobs } from "./routes/list";
import path from "path";

// initialize app
const app = express();

// use bodyParser middleware to parse JSON
app.use(bodyParser.json());

// use PUG as the rendering engine
app.set("views", path.join(getRootDirectory(), "/src/views"));
app.set("view engine", "pug");

// run CI webhook endpoint
app.post("/run", runCI);

// show jobs endpoint
app.get("/list", listJobs);

// show single job endpoint
app.get("/job/:organization/:repository/:sha", showJob);

export default app;
