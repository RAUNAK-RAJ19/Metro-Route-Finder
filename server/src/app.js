const express = require("express");
const cors = require("cors");

const {
  lineColors,
  stationNames,
  graph,
  normalizeStationName
} = require("./data/metroGraph");
const { findShortestRoute, buildJourneySegments } = require("./utils/dijkstra");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "Shortest Metro Route Finder API" });
});

app.get("/api/stations", (req, res) => {
  res.json({
    stations: stationNames,
    lineColors
  });
});

app.get("/api/route", (req, res) => {
  const from = normalizeStationName(req.query.from);
  const to = normalizeStationName(req.query.to);

  if (!from || !to) {
    return res.status(400).json({
      message: "Both from and to stations are required."
    });
  }

  if (!graph[from] || !graph[to]) {
    return res.status(404).json({
      message: "One or both station names are invalid."
    });
  }

  if (from === to) {
    return res.status(400).json({
      message: "Source and destination stations must be different."
    });
  }

  const result = findShortestRoute(graph, from, to);

  if (!result) {
    return res.status(404).json({
      message: "No route is available between these stations."
    });
  }

  const edges = [];
  for (let i = 0; i < result.path.length - 1; i += 1) {
    const currentStation = result.path[i];
    const nextStation = result.path[i + 1];
    const neighbor = graph[currentStation].find((entry) => entry.station === nextStation);

    if (neighbor) {
      edges.push({
        from: currentStation,
        to: nextStation,
        line: neighbor.line,
        time: neighbor.time
      });
    }
  }

  const segments = buildJourneySegments(edges);

  const steps = [];
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    if (i > 0) {
      const previous = segments[i - 1];
      steps.push(`Change from ${previous.line} Line to ${segment.line} Line at ${segment.from}.`);
    }
    steps.push(
      `Take ${segment.line} Line from ${segment.from} to ${segment.to} (${segment.stops} stops, ~${segment.time} mins).`
    );
  }

  return res.json({
    from,
    to,
    totalTime: result.totalTime,
    totalStops: result.path.length - 1,
    path: result.path,
    edges,
    segments,
    steps
  });
});

module.exports = app;
