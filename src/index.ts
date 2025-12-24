import express from "express";
import { runAgent } from "./agent";
import cors from "cors";
import { configs } from "./config";
import orchestrator from "./agent/consensusBuilding";

const app = express();

app.use(express.json());
app.use(cors());

const port = configs.PORT;

app.post("/query", async (req, res) => {
  if (!req.body?.message) {
    res.status(400).send("Query is required");
    return;
  }
  const answer = await runAgent(req.body.message);
  res.status(200).json({ reply: answer });
});

app.post("/collective-decision", async (req, res) => {
  if (!req.body?.message) {
    res.status(400).send("Consensus topic is required");
    return;
  }
  const answer = await orchestrator.judge(req.body.message);
  res.status(200).json({ reply: answer });
});

app.get("/search", async (req, res) => {
  const abc = await orchestrator.metaSearch(req.query.q as string);
  res.status(200).json({ data: abc });
});

app.listen(port, () => {
  console.log("App running at", port);
});
